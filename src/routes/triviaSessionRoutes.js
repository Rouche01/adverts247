const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const { TriviaSession } = require("../models/TriviaSession");
const { Rider } = require("../models/Rider");

const requireAuth = require("../middlewares/requireAuth");
const validateRequest = require("../middlewares/validateRequest");

const {
  classifyFieldFormat,
  triviaSessionFields,
} = require("../utils/required-fields");
const { CustomError } = require("../utils/error");

router.use(requireAuth);

router.post(
  "/trivia-sessions",
  body(classifyFieldFormat(triviaSessionFields, "string")).isString(),
  body(classifyFieldFormat(triviaSessionFields, "number")).isNumeric(),
  validateRequest,
  async (req, res) => {
    const { userId, totalPoints, questions, answeredCorrectly } = req.body;

    const triviaSession = new TriviaSession({
      userId,
      totalPoints,
      questions,
      answeredCorrectly,
    });

    const session = await triviaSession.save();
    res.status(200).json({
      status: true,
      message: "The trivia session is created successfully!",
      session,
    });
  }
);

router.get("/trivia-sessions", async (req, res) => {
  const triviaSessions = await TriviaSession.find();
  res.status(200).json({
    status: true,
    triviaSessions,
  });
});

router.get("/rider/:riderId/trivia-sessions", async (req, res) => {
  const { riderId } = req.params;

  const riderExist = await Rider.findById(riderId);
  if (!riderExist) {
    throw new CustomError(404, "Rider does not exist");
  }

  const triviaSessions = await TriviaSession.find({ userId: rider_id });
  res.status(200).json({
    status: true,
    triviaSessions,
  });
});

module.exports = router;
