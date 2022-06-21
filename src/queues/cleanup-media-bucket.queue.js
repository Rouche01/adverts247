const { Worker, Queue } = require("bullmq");
const { deleteFromMediaBucket } = require("../utils/mediaBucket");

const QUEUE_NAME = "Cleanup Media Bucket";

const connectionOpts = {
  host: "redis",
  port: 6379,
  db: 2,
  password: process.env.REDIS_PASSWORD,
};

const cleanupMediaBucketQueue = new Queue(QUEUE_NAME, {
  connection: connectionOpts,
});

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(job.data);
    const { key, bucketName } = job.data;

    if (bucketName && key) {
      await deleteFromMediaBucket(key, bucketName);
    }
  },
  {
    connection: connectionOpts,
    concurrency: 30,
  }
);

const addCleanupJob = async (name, data) => {
  await cleanupMediaBucketQueue.add(name, data, { attempts: 5 });
};

module.exports = { addCleanupJob, cleanupMediaBucketQueue };
