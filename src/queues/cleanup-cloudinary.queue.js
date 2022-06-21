const { Worker, Queue } = require("bullmq");
const { config } = require("cloudinary").v2;

const { uploader } = require("../middlewares/cloudinaryConfig");

const QUEUE_NAME = "Cleanup Cloudinary";

const connectionOpts = {
  host: "redis",
  port: 6379,
  db: 2,
  password: process.env.REDIS_PASSWORD,
};

const cleanupCloudinaryQueue = new Queue(QUEUE_NAME, {
  connection: connectionOpts,
});

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(job.data);

    config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const { imagePubId } = job.data;

    if (imagePubId) {
      const { result } = await uploader.destroy(imagePubId);
      return result;
    }
  },
  { connection: connectionOpts, concurrency: 30 }
);

const addCloudinaryCleanupJob = async (name, data) => {
  await cleanupCloudinaryQueue.add(name, data, { attempts: 5 });
};

module.exports = { addCloudinaryCleanupJob, cleanupCloudinaryQueue };
