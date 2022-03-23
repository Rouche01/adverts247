const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");

const { Message } = require("../models/Message");
const { CustomError } = require("../utils/error");

router.use(requireAuth);

router.post("/messages", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new CustomError(400, "No message was sent");
  }

  const newMessage = new Message({ userId: req.user._id, message });
  await newMessage.save();
  res.status(200).send({ message });
});

module.exports = router;
