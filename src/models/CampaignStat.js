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

const campaignStatSchema = new mongoose.Schema(
  {
    impressions: {
      type: Number,
      default: 0,
    },
    adSpend: {
      type: Number,
      default: 0,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    playTimeInSeconds: {
      type: Number,
      default: 0,
    },
  },
  options
);

const CampaignStat = mongoose.model("CampaignStat", campaignStatSchema);

module.exports = { CampaignStat };
