const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { CustomError } = require("../utils/error");
const checkRole = require("../middlewares/checkRole");
const { ADMIN } = require("../constants/roles");
const { uploadToMediaBucket } = require("../utils/mediaBucket");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single("video");

router.use(requireAuth);
router.use(checkRole(ADMIN));

router.get("/mediaBucket/prefix/:bucketName", (req, res) => {
  const bucketID = req.params.bucketName;

  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

  const params = {
    Bucket: bucketID,
    Delimiter: "/",
  };

  s3.listObjects(params, (err, data) => {
    if (err) {
      throw new CustomError(500, err.message || "Can't list objects");
    } else {
      // console.log(data);
      const prefixs = data.CommonPrefixes.map((prefix) => {
        return prefix.Prefix.replace("/", "");
      });
      res.status(200).send(prefixs);
    }
  });
});

router.post(
  "/mediaBucket/vod-contents/:bucketname",
  upload,
  async (req, res) => {
    const { videoLabel } = req.body;
    const { bucketname } = req.params;

    // console.log(req.file);
    const fileName = req.file.originalname.split(".");
    const fileType = fileName[fileName.length - 1];

    const data = await uploadToMediaBucket(
      videoLabel,
      fileType,
      bucketname,
      req.file.buffer
    );
    res.status(200).send(data);
  }
);

module.exports = router;
