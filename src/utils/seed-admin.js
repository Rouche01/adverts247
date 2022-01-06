const { Admin } = require("../models/Admin");
require("dotenv").config();

const seedRootAdmin = async () => {
  try {
    const adminExist = await Admin.findOne({
      username: process.env.ROOT_ADMIN_USERNAME,
    });

    if (adminExist) return;

    const rootAdmin = new Admin({
      username: process.env.ROOT_ADMIN_USERNAME,
      password: process.env.ROOT_ADMIN_PASSWORD,
      email: process.env.ROOT_ADMIN_EMAIL,
    });

    await rootAdmin.save();
  } catch (err) {
    console.log(err);
  }
};

module.exports = { seedRootAdmin };
