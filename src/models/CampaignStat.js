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
    },
    playTime: {
      type: String,
      required: true,
    },
  },
  options
);

const CampaignStat = mongoose.model("CampaignStat", campaignStatSchema);

module.exports = { CampaignStat };
