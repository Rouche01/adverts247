const express = require("express");
const { body, query } = require("express-validator");
const { omitBy, isNil } = require("lodash");
const kebabCase = require("lodash/kebabCase");
const isEmpty = require("lodash/isEmpty");
const router = express.Router();

const { Campaign } = require("../models/Campaign");
const { CampaignStat } = require("../models/CampaignStat");
const { CampaignAuditLog } = require("../models/CampaignAuditLog");
const { Advertiser } = require("../models/Advertiser");
const { ADMIN } = require("../constants/roles");

const { clientIp } = require("../middlewares/clientIp");
const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");
const {
  multerUploads,
  dataUri,
  optionalMulterUploads,
} = require("../middlewares/multer");
const {
  cloudinaryConfig,
  uploader,
} = require("../middlewares/cloudinaryConfig");

const {
  classifyFieldFormat,
  campaignCreateFields,
} = require("../utils/required-fields");
const { generateHashId } = require("../utils/generateHashId");
const { CustomError } = require("../utils/error");
const { uploadToMediaBucket } = require("../utils/mediaBucket");

const { IMAGE, VIDEO } = require("../constants/adType");
const {
  ACTIVE,
  PAUSED,
  CLOSED,
  CAMPAIGN_ACTIONS,
} = require("../constants/campaign");
const { RECORD_TYPE } = require("../constants/thumbnail");

const mapFormatToType = {
  mp4: "video",
  png: "image",
  jpeg: "image",
  jpg: "image",
};

const { addThumbnailJob } = require("../queues/thumbnail.queue");

router.use(requireAuth);
router.use(checkRole(ADMIN));

router.get(
  "/campaigns",
  query("status").optional().isIn([ACTIVE, PAUSED, CLOSED]),
  query("type").optional().isIn([IMAGE, VIDEO]),
  query("advertiser").optional().isString(),
  query("limit").optional().isNumeric(),
  query("skip").optional().isNumeric(),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "adBudget"])
    .withMessage("You can only sort by createdAt and adBudget"),
  query("orderBy").optional().isIn(["desc", "asc"]),
  query("startDate").optional().isDate(),
  query("endDate").optional().isDate(),
  validateRequest,
  async (req, res) => {
    const {
      status,
      type,
      limit,
      skip,
      sortBy,
      orderBy,
      startDate,
      endDate,
      advertiser,
    } = req.query;

    console.log(startDate, endDate);
    const dateFilter = {};

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      };
    }

    const sort = {};
    const filterOptions = omitBy({ status, adType: type, advertiser }, isNil);
    let paginationOptions = omitBy({ limit, skip }, isNil);

    Object.entries(paginationOptions).forEach(
      ([key, val]) => (paginationOptions[key] = parseInt(val))
    );

    if (sortBy && orderBy) {
      sort[sortBy] = orderBy === "desc" ? -1 : 1;
    }

    const count = await Campaign.find(
      { ...filterOptions, ...dateFilter },
      null,
      {
        sort,
      }
    ).countDocuments();

    const campaigns = await Campaign.find(
      { ...filterOptions, ...dateFilter },
      null,
      {
        ...paginationOptions,
        sort,
      }
    )
      .populate("advertiser")
      .populate("campaignStat");

    res.send({ campaigns, size: count });
  }
);

router.get("/campaigns/:campaignId", async (req, res) => {
  const { campaignId } = req.params;
  const campaign = await Campaign.findOne({ campaignID: campaignId })
    .populate("advertiser")
    .populate("campaignStat");

  if (!campaign) throw new CustomError(404, "Campaign does not exist");
  res.send(campaign);
});

router.post(
  "/campaigns",
  clientIp,
  multerUploads("campaignMedia"),
  cloudinaryConfig,
  body(classifyFieldFormat(campaignCreateFields, "string")).isString(),
  body(classifyFieldFormat(campaignCreateFields, "number")).isNumeric(),
  body("adType").isIn(["image", "video"]).withMessage("Invalid type"),
  body("duration").isJSON(),
  validateRequest,
  async (req, res) => {
    const campaignID = generateHashId({ prefix: "AD", length: 6 });
    const duration = JSON.parse(req.body.duration);

    const videoOrImg = req.file.mimetype.split("/")[0];
    if (req.body.adType !== videoOrImg.toLowerCase())
      throw new CustomError(400, "Select the correct ad type");

    let campaignMedia, mediaBucketResponse;

    if (videoOrImg === IMAGE) {
      const file = dataUri(req).content;
      const { secure_url } = await uploader.upload(file, {
        folder: "assets/CAMPAIGNS",
      });
      campaignMedia = secure_url;
    }

    if (videoOrImg === VIDEO) {
      const fileName = req.file.originalname.split(".");
      const fileType = fileName[fileName.length - 1];

      mediaBucketResponse = await uploadToMediaBucket(
        kebabCase(req.body.campaignName),
        fileType,
        "247-adverts-watchfolder",
        req.file.buffer
      );

      campaignMedia = mediaBucketResponse.data.Location;
    }

    const campaign = new Campaign({
      campaignID,
      campaignMedia,
      ...req.body,
      duration,
      advertiser: req.body.advertiser,
    });

    const campaignStat = new CampaignStat({
      campaign: campaign.id,
    });

    campaign.campaignStat = campaignStat.id;

    const campaignAuditLog = new CampaignAuditLog({
      action: CAMPAIGN_ACTIONS.CREATED,
      actor: req.user.id,
      campaign: campaign.id,
      from: req.clientIp,
    });

    const advertiser = await Advertiser.findById(req.body.advertiser);
    advertiser.campaigns.push(campaign);

    const session = await Campaign.startSession();
    session.startTransaction();

    const opts = { session };

    await campaignStat.save(opts);
    await campaign.save(opts);
    await campaignAuditLog.save(opts);
    await advertiser.save(opts);

    await session.commitTransaction();
    session.endSession();

    const { data } = mediaBucketResponse;
    await addThumbnailJob("generate thumbnail for campaign", {
      bucket: data.Bucket,
      key: data.Key,
      title: kebabCase(req.body.campaignName),
      recordId: campaign.campaignID,
      recordType: RECORD_TYPE.CAMPAIGN,
    });

    res.send(campaign);
  }
);

router.patch(
  "/campaigns/:campaignId",
  optionalMulterUploads(),
  cloudinaryConfig,
  clientIp,
  body("adBudget").optional().isNumeric(),
  body("duration").optional().isJSON(),
  body("campaignName").optional().isString(),
  body("adType")
    .optional()
    .isIn(["image", "video"])
    .withMessage("Invalid type"),
  validateRequest,
  async (req, res) => {
    const { campaignId } = req.params;
    const { adBudget, duration, campaignName, adType } = req.body;

    const campaign = await Campaign.findOne({ campaignID: campaignId });
    if (!campaign) throw new CustomError(404, "Campaign does not exist");

    const campaignMediaSplit = campaign.campaignMedia.split(".");
    const campaignMediaType = campaignMediaSplit[campaignMediaSplit.length - 1];

    if (
      !req?.files[0] &&
      adType &&
      adType !== mapFormatToType[campaignMediaType]
    ) {
      throw new CustomError(400, "Media format is not compatible with ad type");
    }

    const updateFields = {};

    if (req.files && req.files[0] !== undefined) {
      console.log(req.files);
      const videoOrImg = req.files[0].mimetype.split("/")[0];

      if (adType && adType !== videoOrImg) {
        throw new CustomError(400, "Select the correct ad type");
      }

      if (!adType && campaign.adType !== videoOrImg) {
        throw new CustomError(
          400,
          "Upload the appropriate media type for this campaign"
        );
      }

      if (videoOrImg === IMAGE) {
        const file = dataUri(req).content;
        const { secure_url } = await uploader.upload(file, {
          folder: "assets/CAMPAIGNS",
        });
        updateFields["campaignMedia"] = secure_url;
      }

      if (videoOrImg === VIDEO) {
        const fileName = req.files[0].originalname.split(".");
        const fileType = fileName[fileName.length - 1];

        mediaBucketResponse = await uploadToMediaBucket(
          kebabCase(campaignName || campaign.campaignName),
          fileType,
          "247-adverts-watchfolder",
          req.files[0].buffer
        );

        const { data } = mediaBucketResponse;

        updateFields["campaignMedia"] = data.Location;
        await addThumbnailJob("generate thumbnail for campaign", {
          bucket: data.Bucket,
          key: data.Key,
          title: kebabCase(campaignName || campaign.campaignName),
          recordId: campaign.campaignID,
          recordType: RECORD_TYPE.CAMPAIGN,
        });
      }
    }

    const parsedDuration = duration ? JSON.parse(duration) : null;
    const update = omitBy(
      {
        ...updateFields,
        adBudget,
        duration: parsedDuration,
        campaignName,
        adType,
      },
      isNil
    );

    if (isEmpty(update)) throw new CustomError(400, "No update was sent");

    const campaignAuditLog = new CampaignAuditLog({
      action: CAMPAIGN_ACTIONS.EDITED,
      actor: req.user.id,
      campaign: campaign.id,
      from: req.clientIp,
      changes: JSON.stringify(update),
    });

    const session = await Campaign.startSession();
    session.startTransaction();

    const opts = { session };

    await campaignAuditLog.save(opts);
    await campaign.updateOne(update, opts);

    await session.commitTransaction();
    session.endSession();

    res.send({ message: "Campaign edited successfully." });
  }
);

router.patch(
  "/change-status/:campaignId",
  clientIp,
  body("status").isIn([ACTIVE, PAUSED, CLOSED]).withMessage("Invalid status"),
  body("action")
    .isIn(["terminate", "pause", "resume"])
    .withMessage("Invalid action"),
  validateRequest,
  async (req, res) => {
    const { campaignId } = req.params;
    const { status, action } = req.body;

    const mapStatusToAction = {
      resume: CAMPAIGN_ACTIONS.RESTARTED,
      pause: CAMPAIGN_ACTIONS.PAUSED,
      terminate: CAMPAIGN_ACTIONS.CLOSED,
    };

    const update = { status };
    const campaign = await Campaign.findOne({ campaignID: campaignId });

    if (!campaign) throw new CustomError(404, "Campaign does not exist");

    const campaignAuditLog = new CampaignAuditLog({
      action: mapStatusToAction[action],
      actor: req.user.id,
      campaign: campaign.id,
      from: req.clientIp,
    });

    const session = await Campaign.startSession();
    session.startTransaction();

    const opts = { session };

    await campaign.updateOne(update, opts);
    await campaignAuditLog.save(opts);

    await session.commitTransaction();
    session.endSession();

    res.send({ message: "Updated status successfully" });
  }
);

module.exports = router;
