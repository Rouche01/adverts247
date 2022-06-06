const mongoose = require("mongoose");

const options = {
  toJSON: {
    versionKey: false,
    timestamps: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  },
};

const campaignSchema = new mongoose.Schema(
  {
    campaignID: {
      type: String,
      required: true,
    },
    campaignName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "closed", "paused"],
      default: "active",
    },
    advertiser: {
      type: String,
      required: true,
    },
    adType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    adBudget: {
      type: Number,
      required: true,
    },
    campaignMedia: {
      type: String,
      required: true,
    },
    duration: {
      type: [Date],
      length: 2,
    },
  },
  options
);

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = { Campaign };
