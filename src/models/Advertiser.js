const mongoose = require("mongoose");
const { User, options } = require("./User");

const advertiserSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    addressLineOne: {
      type: String,
      required: true,
    },
    addressLineTwo: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  options
);

const Advertiser = User.discriminator("Advertiser", advertiserSchema);

module.exports = { Advertiser };
