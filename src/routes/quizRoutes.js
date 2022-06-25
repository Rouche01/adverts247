const express = require("express");
const { body, query } = require("express-validator");
const omitBy = require("lodash/omitBy");
const isNil = require("lodash/isNil");

const router = express.Router();

const { Quiz } = require("../models/Quiz");
const { multerUploads, dataUri } = require("../middlewares/multer");
const requireAuth = require("../middlewares/requireAuth");
const {
  cloudinaryConfig,
  uploader,
} = require("../middlewares/cloudinaryConfig");
const validateRequest = require("../middlewares/validateRequest");

const { QUIZ_IMAGE_PATH } = require("../constants/cloudinaryFolders");
const { CustomError } = require("../utils/error");
const {
  addCloudinaryCleanupJob,
} = require("../queues/cleanup-cloudinary.queue");

router.use(requireAuth);

router.get(
  "/quizzes",
  query("limit").optional().isNumeric(),
  query("skip").optional().isNumeric(),
  query("sortBy")
    .optional()
    .isIn(["createdAt"])
    .withMessage("You can only sort by createdAt"),
  query("orderBy").optional().isIn(["desc", "asc"]),
  validateRequest,
  async (req, res) => {
    const { limit, skip, sortBy, orderBy } = req.query;

    const sort = {};
    let paginationOptions = omitBy({ limit, skip }, isNil);

    Object.entries(paginationOptions).forEach(
      ([key, val]) => (paginationOptions[key] = parseInt(val))
    );

    if (sortBy && orderBy) {
      sort[sortBy] = orderBy === "desc" ? -1 : 1;
    }

    const count = await Quiz.find(null, null, {
      sort,
    }).countDocuments();
    const quizzes = await Quiz.find(null, null, { ...paginationOptions, sort });

    res.status(200).json({
      status: true,
      quizzes,
      count,
    });
  }
);

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
  multerUploads("quizImage"),
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

    const file = dataUri(req).content;
    const cloudinaryObj = await uploader.upload(file, {
      folder: QUIZ_IMAGE_PATH,
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
);

router.delete("/quiz/:id", cloudinaryConfig, async (req, res) => {
  const quizExist = await Quiz.findById(req.params.id);
  if (!quizExist) throw new CustomError(404, "This quiz does not exist");

  const { quizImgUri } = quizExist;
  const splitImgArr = quizImgUri.split("/");
  const imgPubId = splitImgArr[splitImgArr.length - 1].split(".")[0];

  await Quiz.deleteOne({ _id: req.params.id });
  await addCloudinaryCleanupJob("delete quiz image", {
    imagePubId: `${QUIZ_IMAGE_PATH}/${imgPubId}`,
  });

  res.status(200).json({
    status: true,
    message: "Quiz deleted successfully",
    deletedQuiz: quizExist,
  });
});

module.exports = router;
