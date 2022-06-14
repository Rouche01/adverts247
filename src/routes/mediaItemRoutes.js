const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { MediaItem } = require("../models/MediaItem");

const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");
const { multerUploads } = require("../middlewares/multer");
const { ADMIN } = require("../constants/roles");

const {
  mediaItemCreateFields,
  classifyFieldFormat,
} = require("../utils/required-fields");
const { generateHashId } = require("../utils/generateHashId");
const { uploadToMediaBucket } = require("../utils/mediaBucket");
const { CustomError } = require("../utils/error");

router.use(requireAuth);
router.use(checkRole(ADMIN));

router.post(
  "/mediaitems",
  multerUploads("mediaItem"),
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

    const data = await uploadToMediaBucket(
      title,
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
    });

    await mediaItem.save();

    res.send(mediaItem);
  }
);

module.exports = router;
