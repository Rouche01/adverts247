const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const { Quiz } = require("../models/Quiz");
const { multerUploads, dataUri } = require("../middlewares/multer");
const requireAuth = require("../middlewares/requireAuth");
const {
  cloudinaryConfig,
  uploader,
} = require("../middlewares/cloudinaryConfig");

router.use(requireAuth);

router.get("/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    const number = quizzes.length;
    res.status(200).json({
      status: true,
      quizzes,
      number,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
});

router.get("/quiz/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id });
    res.status(200).json({
      status: true,
      quiz,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
});

router.post(
  "/quizzes",
  body([
    "question",
    "option1",
    "option2",
    "option3",
    "option4",
    "answer",
  ]).isString(),
  body("image").notEmpty(),
  multerUploads,
  cloudinaryConfig,
  async (req, res) => {
    const error = validationResult(req);
    const hasErrors = !error.isEmpty();
    if (hasErrors) {
      return res.status(400).send(error);
    }
    const { question, option1, option2, option3, option4, answer, points } =
      req.body;
    // res.setHeader('Content-Type', 'application/json')
    if (req.file) {
      const file = dataUri(req).content;
      try {
        const cloudinaryObj = await uploader.upload(file);
        const { secure_url } = cloudinaryObj;
        const options = [option1, option2, option3, option4];

        let quiz;

        if (points) {
          quiz = new Quiz({
            quizImgUri: secure_url,
            question,
            options,
            answer,
            points,
          });
        } else {
          quiz = new Quiz({
            quizImgUri: secure_url,
            question,
            options,
            answer,
          });
        }

        try {
          await quiz.save();
          res.status(200).json({
            status: true,
            message: "Quiz created successfully",
          });
        } catch (err) {
          res.status(500).json({
            status: true,
            message: err.message,
          });
        }
      } catch (err) {
        res.status(401).json({
          status: false,
          message: err.message,
        });
      }
    }
  }
);

router.delete("/quiz/:id", cloudinaryConfig, async (req, res) => {
  try {
    const quizExist = await Quiz.findOne({ _id: req.params.id });
    if (!quizExist)
      return res.status(404).json({
        status: false,
        message: "This quiz does not exist",
      });

    const { quizImgUri } = quizExist;
    const splitImgArr = quizImgUri.split("/");
    const imgPubId = splitImgArr[splitImgArr.length - 1].split(".")[0];

    const { result } = await uploader.destroy(imgPubId);
    if (result !== "ok")
      return res.status(500).json({
        status: false,
        message: "Unable to delete quiz resource",
      });

    await Quiz.deleteOne({ _id: req.params.id });
    res.status(200).json({
      status: true,
      message: "Quiz deleted successfully",
      deletedQuiz: quizExist,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
});

module.exports = router;
