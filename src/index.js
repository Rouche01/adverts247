require("../src/models/User");
require("../src/models/Message");
require("../src/models/Quiz.js");
require("../src/models/Rider");
require("../src/models/TriviaSession");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const driverRoutes = require("./routes/driverRoutes");
const messageRoutes = require("./routes/messageRoutes");
const mediaBucketRoutes = require("./routes/mediaBucketRoutes");
const quizRoutes = require("./routes/quizRoutes");
const riderRoutes = require("./routes/riderRoutes");
const triviaSessionRoutes = require("./routes/triviaSessionRoutes");

const { seedRootAdmin } = require("../src/utils/seed-admin");

const requireAuth = require("./middlewares/requireAuth");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(authRoutes);
app.use(driverRoutes);
app.use(messageRoutes);
app.use(mediaBucketRoutes);
app.use(quizRoutes);
app.use(riderRoutes);
app.use(triviaSessionRoutes);

app.get("/", requireAuth, (req, res) => {
  res.send("Welcome to Adverts 247 Rest API");
});

app.listen(PORT, () => {
  console.log(`Localhost is listening on port ${PORT}`);
  console.log(process.env.MONGO_URI);
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

mongoose.connection.on("connected", async () => {
  console.log("Successfully connected to mongo instance");
  await seedRootAdmin();
  console.log("Successfully added root admin");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
