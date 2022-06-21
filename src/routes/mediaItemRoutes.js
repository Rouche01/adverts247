const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const omitBy = require("lodash/omitBy");
const isNil = require("lodash/isNil");
const kebabCase = require("lodash/kebabCase");

const { MediaItem } = require("../models/MediaItem");

const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");
const { multerUploads } = require("../middlewares/multer");
const { cloudinaryConfig } = require("../middlewares/cloudinaryConfig");
const { ADMIN } = require("../constants/roles");

const {
  mediaItemCreateFields,
  classifyFieldFormat,
} = require("../utils/required-fields");
const { generateHashId } = require("../utils/generateHashId");
const {
  uploadToMediaBucket,
  deleteFromMediaBucket,
} = require("../utils/mediaBucket");
const { CustomError } = require("../utils/error");
const { addThumbnailJob } = require("../queues/thumbnail.queue");
const { addCleanupJob } = require("../queues/cleanup-media-bucket.queue");

router.use(requireAuth);
router.use(checkRole(ADMIN));

router.get(
  "/mediaitems",
  query("limit").optional().isNumeric(),
  query("skip").optional().isNumeric(),
  validateRequest,
  async (req, res) => {
    const { limit, skip } = req.query;

    let paginationOptions = omitBy({ limit, skip }, isNil);
    Object.entries(paginationOptions).forEach(
      ([key, val]) => (paginationOptions[key] = parseInt(val))
    );

    const count = await MediaItem.find({}).countDocuments();
    const mediaItems = await MediaItem.find(null, null, {
      ...paginationOptions,
    });

    res.send({ mediaItems, size: count });
  }
);

router.get("/mediaitems/:mediaId", async (req, res) => {
  const { mediaId } = req.params;
  const mediaItem = await MediaItem.findOne({ mediaId });

  if (!mediaItem) throw new CustomError(404, "Unable to find media item");

  res.send(mediaItem);
});

router.post(
  "/mediaitems",
  multerUploads("mediaItem"),
  cloudinaryConfig,
  body(classifyFieldFormat(mediaItemCreateFields, "string")).isString(),
  validateRequest,
  async (req, res) => {
    const mediaId = generateHashId({ prefix: "MD", length: 6 });
    const { title, duration, category } = req.body;

    const mediaType = req.file.mimetype.split("/")[0];

    if (mediaType !== "video")
      throw new CustomError(400, "Invalid media type, only video allowed!");

    const fileName = req.file.originalname.split(".");
    const fileType = fileName[fileName.length - 1];

    const transformedTitle = kebabCase(title);

    const { data, s3Key } = await uploadToMediaBucket(
      transformedTitle,
      fileType,
      "vod-watchfolder-247",
      req.file.buffer
    );

    const mediaItem = new MediaItem({
      mediaId,
      title,
      duration,
      category,
      mediaUri: data.Location,
      s3Key,
    });

    await mediaItem.save();
    await addThumbnailJob(title, {
      bucket: data.Bucket,
      key: data.Key,
      title: transformedTitle,
      recordId: mediaItem.mediaId,
    });

    res.send("mediaItem");
  }
);

router.delete("/mediaitems/:mediaId", async (req, res) => {
  const { mediaId } = req.params;

  const mediaItem = await MediaItem.findOne({ mediaId });
  if (!mediaItem) throw new CustomError(404, "Media item does not exist");

  await MediaItem.deleteOne({ mediaId });
  await addCleanupJob("deleteInWatchFolder", {
    key: `${mediaItem.s3Key}.mp4`,
    bucketName: "vod-watchfolder-247/inputs",
  });
  await addCleanupJob("deleteInConvertedFolder", {
    key: `${mediaItem.s3Key}/`,
    bucketName: "vod-247bucket",
  });

  res.send({ message: "Deleted item successfully" });
});

module.exports = router;
