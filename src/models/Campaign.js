const mongoose = require("mongoose");

const options = {
  toJSON: {
    versionKey: false,
    timestamps: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
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
    impressions: {
      type: Number,
      default: 0,
    },
    interactions: {
      type: Number,
      default: 0,
    },
    vehicles: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "stopped"],
      default: "pending",
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertiser",
    },
  },
  options
);

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = { Campaign };
