const mongoose = require("mongoose");
const { User, options } = require("./User");

const advertiserSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    advertiserId: {
      type: String,
      required: true,
    },
    addressLineOne: {
      type: String,
    },
    addressLineTwo: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
  },
  options
);

const Advertiser = User.discriminator("Advertiser", advertiserSchema);

module.exports = { Advertiser };
