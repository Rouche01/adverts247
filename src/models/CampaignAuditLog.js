const mongoose = require("mongoose");

const options = {
  toJSON: {
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  },
};

const campaignAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["edited", "closed", "paused", "restarted", "created"],
      required: true,
    },
    changes: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
  },
  options
);

const CampaignAuditLog = mongoose.model(
  "CampaignAuditLog",
  campaignAuditLogSchema
);
module.exports = { CampaignAuditLog };
