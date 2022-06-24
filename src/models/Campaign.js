const mongoose = require("mongoose");

const options = {
  timestamps: true,
  toJSON: {
    versionKey: false,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertiser",
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
    videoThumbnail: {
      type: String,
      default:
        "https://fakeimg.pl/640x360/282828/eae0d0/?retina=1&text=Generating%20thumbnail...&font_size=52",
    },
    campaignStat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampaignStat",
    },
  },
  options
);

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = { Campaign };
