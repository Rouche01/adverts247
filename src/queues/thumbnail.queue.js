const { Queue, Worker } = require("bullmq");
const { config } = require("cloudinary").v2;

const { uploader } = require("../middlewares/cloudinaryConfig");
const { generateSignedUrl } = require("../utils/mediaBucket");
const {
  generateThumbnail,
  deleteThumbnailFromDisk,
} = require("../utils/mediaUtils");

const { MediaItem } = require("../models/MediaItem");

const QUEUE_NAME = "Thumbnails";

const connectionOpts = {
  host: "redis",
  port: 6379,
  db: 1,
  password: process.env.REDIS_PASSWORD,
};

const generateThumbnailQueue = new Queue(QUEUE_NAME, {
  connection: connectionOpts,
});

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(job.data);
    const { bucket, key, title, recordId } = job.data;

    config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (bucket && key && title && recordId) {
      const signedUrl = await generateSignedUrl(bucket, key);
      const thumbnail = await generateThumbnail(signedUrl, title);

      const { secure_url } = await uploader.upload(thumbnail, {
        folder: "assets/THUMBNAILS",
      });

      await deleteThumbnailFromDisk(thumbnail);
      await MediaItem.findOneAndUpdate(
        { mediaId: recordId },
        { previewUri: secure_url },
        { useFindAndModify: false }
      );
    }
  },
  {
    connection: connectionOpts,
    concurrency: 30,
  }
);

const addThumbnailJob = async (name, data) => {
  await generateThumbnailQueue.add(name, data, { attempts: 5 });
};

module.exports = { addThumbnailJob, generateThumbnailQueue };
