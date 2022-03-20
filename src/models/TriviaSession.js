const mongoose = require("mongoose");

const triviaSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    questions: {
      type: Number,
      default: 0,
    },
    answeredCorrectly: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const TriviaSession = mongoose.model("TriviaSession", triviaSessionSchema);

module.exports = { TriviaSession };
