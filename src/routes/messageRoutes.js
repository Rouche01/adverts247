const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");

const { Message } = require("../models/Message");

router.use(requireAuth);

router.post("/messages", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(422).json({
      error: "No message was sent",
    });
  }

  const newMessage = new Message({ userId: req.user._id, message });

  try {
    await newMessage.save();
    res.status(200).send({ message });
  } catch (error) {
    res.status(422).json({
      error,
    });
  }
});

module.exports = router;
