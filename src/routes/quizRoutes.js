const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const { Quiz } = require("../models/Quiz");
const { multerUploads, dataUri } = require("../middlewares/multer");
const requireAuth = require("../middlewares/requireAuth");
const {
  cloudinaryConfig,
  uploader,
} = require("../middlewares/cloudinaryConfig");
const { CustomError } = require("../utils/error");
const validateRequest = require("../middlewares/validateRequest");

router.use(requireAuth);

router.get("/quizzes", async (req, res) => {
  const quizzes = await Quiz.find();
  const number = quizzes.length;
  res.status(200).json({
    status: true,
    quizzes,
    number,
  });
});

router.get("/quiz/:id", async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    throw new CustomError(404, "Quiz does not exist");
  }
  res.status(200).json({
    status: true,
    quiz,
  });
});

router.post(
  "/quizzes",
  multerUploads(),
  body([
    "question",
    "option1",
    "option2",
    "option3",
    "option4",
    "answer",
  ]).isString(),
  validateRequest,
  cloudinaryConfig,
  async (req, res) => {
    const { question, option1, option2, option3, option4, answer, points } =
      req.body;
    // res.setHeader('Content-Type', 'application/json')
    if (req.file) {
      const file = dataUri(req).content;
      const cloudinaryObj = await uploader.upload(file, {
        folder: "advert-247-app/QUIZZES",
      });
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

      await quiz.save();
      res.status(200).json({
        status: true,
        message: "Quiz created successfully",
      });
    }
  }
);

router.delete("/quiz/:id", cloudinaryConfig, async (req, res) => {
  const quizExist = await Quiz.findById(req.params.id);
  if (!quizExist) throw new CustomError(404, "This quiz does not exist");

  const { quizImgUri } = quizExist;
  const splitImgArr = quizImgUri.split("/");
  const imgPubId = splitImgArr[splitImgArr.length - 1].split(".")[0];

  const { result } = await uploader.destroy(imgPubId);
  if (result !== "ok")
    throw new CustomError(500, "Unable to delete quiz resource");

  await Quiz.deleteOne({ _id: req.params.id });
  res.status(200).json({
    status: true,
    message: "Quiz deleted successfully",
    deletedQuiz: quizExist,
  });
});

module.exports = router;
