const mongoose = require("mongoose");
const { User, options } = require("./User");

const bankInfoSchema = new mongoose.Schema({
  bank: {
    name: String,
    code: String,
  },
  accountNumber: String,
  accountName: String,
  recipientCode: String,
});

const extraInfoSchema = new mongoose.Schema({
  favouriteMeal: String,
  favouriteHobby: String,
  askMeAbout: String,
  vacationSpot: String,
});

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    inviteCode: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    driversValidId: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: false,
    },
    extraInfo: extraInfoSchema,
    bankInformation: bankInfoSchema,
  },
  options
);

const Driver = User.discriminator("Driver", driverSchema);

module.exports = { Driver };
