const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Rider = mongoose.model("Rider", riderSchema);

module.exports = { Rider };
