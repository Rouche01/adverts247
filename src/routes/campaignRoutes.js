const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const { Campaign } = require("../models/Campaign");
const { ADMIN } = require("../constants/roles");

const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");
const { multerUploads, dataUri } = require("../middlewares/multer");

const {
  classifyFieldFormat,
  campaignCreateFields,
} = require("../utils/required-fields");
const { generateHashId } = require("../utils/generateHashId");
const { CustomError } = require("../utils/error");
const {
  cloudinaryConfig,
  uploader,
} = require("../middlewares/cloudinaryConfig");
const { IMAGE, VIDEO } = require("../constants/adType");
const { uploadToMediaBucket } = require("../utils/mediaBucket");

router.use(requireAuth);
router.use(checkRole(ADMIN));

router.get("/campaigns", async (req, res) => {
  const campaigns = await Campaign.find();
  res.send(campaigns);
});

router.post(
  "/campaigns",
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

    let campaignMedia;

    if (videoOrImg === IMAGE) {
      const file = dataUri(req).content;
      const { secure_url } = await uploader.upload(file, {
        folder: "advert-247-app/ADS",
      });
      campaignMedia = secure_url;
    }

    if (videoOrImg === VIDEO) {
      const fileName = req.file.originalname.split(".");
      const fileType = fileName[fileName.length - 1];

      const data = await uploadToMediaBucket(
        req.body.campaignName,
        fileType,
        "247-adverts-watchfolder",
        req.file.buffer
      );

      campaignMedia = data.Location;
    }

    const campaign = new Campaign({
      campaignID,
      campaignMedia,
      ...req.body,
      duration,
    });

    await campaign.save();
    res.send(campaign);
  }
);

module.exports = router;
