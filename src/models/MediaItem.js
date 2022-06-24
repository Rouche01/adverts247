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
    s3Key: {
      type: String,
      required: true,
    },
    previewUri: {
      type: String,
      default:
        "https://fakeimg.pl/640x360/282828/eae0d0/?retina=1&text=Generating%20thumbnail...&font_size=52",
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
