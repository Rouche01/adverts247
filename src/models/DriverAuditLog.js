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

const driverAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["edited", "suspended", "reactivated", "created"],
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
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
  },
  options
);

const DriverAuditLog = mongoose.model(
  "DriverAuditLog",
  driverAuditLogSchema
);
module.exports = { DriverAuditLog };
