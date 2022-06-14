const mongoose = require("mongoose");

const mediaItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    plays: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["live", "not-live"],
      default: "not-live",
    },
  },
  { timestamps: true }
);

const MediaItem = mongoose.model("MediaItem", mediaItem);

module.exports = { MediaItem };
