require("express-async-errors");
require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { redisClient } = require("./utils/redisClient");

const app = express();
const serverAdapter = new ExpressAdapter();

const authRoutes = require("./routes/authRoutes");
const driverRoutes = require("./routes/driverRoutes");
const messageRoutes = require("./routes/messageRoutes");
const mediaBucketRoutes = require("./routes/mediaBucketRoutes");
const quizRoutes = require("./routes/quizRoutes");
const riderRoutes = require("./routes/riderRoutes");
const triviaSessionRoutes = require("./routes/triviaSessionRoutes");
const streamRoutes = require("./routes/streamRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const advertiserRoutes = require("./routes/advertiserRoutes");
const mediaItemRoutes = require("./routes/mediaItemRoutes");

const { generateThumbnailQueue } = require("./queues/thumbnail.queue");
const {
  cleanupMediaBucketQueue,
} = require("./queues/cleanup-media-bucket.queue");
const { cleanupCloudinaryQueue } = require("./queues/cleanup-cloudinary.queue");

const { setQueues } = createBullBoard({
  queues: [
    new BullMQAdapter(generateThumbnailQueue),
    new BullMQAdapter(cleanupMediaBucketQueue),
    new BullMQAdapter(cleanupCloudinaryQueue),
  ],
  serverAdapter: serverAdapter,
});

serverAdapter.setBasePath("/admin/queues");

const { seedRootAdmin } = require("../src/utils/seed-admin");
const {
  transporter,
  replaceTemplateLiterals,
} = require("./utils/mailTransporter");

// const requireAuth = require("./middlewares/requireAuth");
const { errorHandler } = require("./middlewares/errorHandler");
require("dotenv").config();

const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/admin/queues", serverAdapter.getRouter());
app.use("/api", authRoutes);
app.use("/api", driverRoutes);
app.use("/api", advertiserRoutes);
app.use("/api", mediaItemRoutes);
app.use("/api", campaignRoutes);
app.use("/api", messageRoutes);
app.use("/api", mediaBucketRoutes);
app.use("/api", quizRoutes);
app.use("/api", riderRoutes);
app.use("/api", triviaSessionRoutes);
app.use("/api", streamRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Adverts 247 Rest API");
});

app.post("/testemail", async (req, res) => {
  const filePath = path.join(
    __dirname,
    "./email-templates/register-confirm.html"
  );
  const htmlToSend = replaceTemplateLiterals(filePath, {
    firstname: "Richard",
  });
  const info = await transporter.sendMail({
    from: '"Soji from Adverts247" <soji@adverts247.com>',
    to: "richardemate@gmail.com",
    subject: "Welcome to Adverts247",
    text: "This is a test",
    html: htmlToSend,
  });

  console.log("Message sent: %s", info.messageId);

  res.send("done");
});

app.use(errorHandler);

const start = async () => {
  await redisClient.connect();
  redisClient.on("error", (error) => console.log(error));
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    await seedRootAdmin();
  } catch (err) {
    console.log(err);
  }

  app.listen(PORT, () => {
    console.log(`Localhost is listening on port ${PORT}`);
  });
};

start();
