const mongoose = require("mongoose");

const mediaItemSchema = new mongoose.Schema(
  {
    mediaId: {
      type: String,
      required: true,
    },
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
    mediaUri: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const MediaItem = mongoose.model("MediaItem", mediaItemSchema);

module.exports = { MediaItem };
