const mongoose = require("mongoose");
const { User, options } = require("./User");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
  },
  options
);

const Admin = User.discriminator("Admin", adminSchema);

module.exports = { Admin };
