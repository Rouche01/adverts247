const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { redisClient } = require("./utils/redisClient");

const authRoutes = require("./routes/authRoutes");
const driverRoutes = require("./routes/driverRoutes");
const messageRoutes = require("./routes/messageRoutes");
const mediaBucketRoutes = require("./routes/mediaBucketRoutes");
const quizRoutes = require("./routes/quizRoutes");
const riderRoutes = require("./routes/riderRoutes");
const triviaSessionRoutes = require("./routes/triviaSessionRoutes");
const streamRoutes = require("./routes/streamRoutes");

const { seedRootAdmin } = require("../src/utils/seed-admin");

const requireAuth = require("./middlewares/requireAuth");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api", authRoutes);
app.use("/api", driverRoutes);
app.use("/api", messageRoutes);
app.use("/api", mediaBucketRoutes);
app.use("/api", quizRoutes);
app.use("/api", riderRoutes);
app.use("/api", triviaSessionRoutes);
app.use("/api", streamRoutes);

app.get("/", requireAuth, (req, res) => {
  res.send("Welcome to Adverts 247 Rest API");
});

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
    console.log(process.env.MONGO_URI);
  });
};

start();
