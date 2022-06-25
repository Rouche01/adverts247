const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    quizImgUri: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 2,
    },
    timesAnswered: {
      type: Number,
      default: 0,
    },
    timesAnsweredCorrectly: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = { Quiz };
