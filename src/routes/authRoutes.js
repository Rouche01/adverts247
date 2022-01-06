const express = require("express");
const router = express.Router();
const { Driver } = require("../models/Driver");
const { Admin } = require("../models/Admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/drivers/signup", async (req, res) => {
  const { email, name, phoneNumber, password, city, extraInfo, inviteCode } =
    req.body;

  if (!email || !name || !phoneNumber || !password || !city || !extraInfo) {
    return res.status(422).send({
      error: "You are not entering all the data required to sign up.",
    });
  }

  try {
    const existingDriverWithEmail = await Driver.findOne({ email });

    if (existingDriverWithEmail) {
      return res.status(400).json({
        error: "Driver with this email exists already",
      });
    }

    const existingDriverWithPhoneNo = await Driver.findOne({ phoneNumber });

    if (existingDriverWithPhoneNo) {
      return res.status(400).json({
        error: "Driver with this phone number exists already",
      });
    }

    const driver = new Driver({
      email,
      name,
      phoneNumber,
      password,
      city,
      extraInfo,
    });

    await driver.save();
    const token = jwt.sign({ userId: driver.id }, process.env.TOKEN_SECRET_KEY);
    res.status(201).send({
      message: "successfully registered!",
      token,
    });
  } catch (err) {
    res.status(400).send({
      error: `unable to register, ${err}`,
    });
  }
});

router.post("/drivers/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "You have to provide both email and password.",
    });
  }

  try {
    const driver = await Driver.findOne({ email });

    if (!driver) {
      return res.status(400).json({
        status: "error",
        message: "You are logging with wrong credentials",
      });
    }

    await driver.comparePassword(password);
    const token = jwt.sign({ userId: driver.id }, process.env.TOKEN_SECRET_KEY);
    res.status(200).send({
      message: "User signed in successfully.",
      token,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: `You are logging with wrong credentials`,
    });
  }
});

router.post("/admin/signup", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({
      status: "error",
      message: "You have to provide both email, password and username",
    });
  }

  const existingAdminWithUsername = await Admin.findOne({ username });

  if (existingAdminWithUsername) {
    return res.status(400).json({
      error: "This username is not available",
    });
  }

  const existingAdminWithEmail = await Admin.findOne({ email });

  if (existingAdminWithEmail) {
    return res.status(400).json({
      error: "An admin with this email exists already",
    });
  }

  const admin = new Admin({
    email,
    password,
    username,
  });

  try {
    await admin.save();
    const token = jwt.sign({ userId: admin.id }, process.env.TOKEN_SECRET_KEY);
    res.status(201).send({
      message: "successfully registered!",
      token,
      user: admin,
    });
  } catch (err) {
    res.status(400).send({
      error: `unable to register, ${err}`,
    });
  }
});

router.post("/admin/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "You have to provide both email and password.",
    });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        error: `You are logging in  with wrong credentials`,
      });
    }

    await admin.comparePassword(password);
    const token = jwt.sign({ userId: admin.id }, process.env.TOKEN_SECRET_KEY);
    res.status(200).json({
      message: "Admin signed in successfully.",
      token,
      user: admin,
    });
  } catch (err) {
    res.status(400).json({
      error: `You are logging with wrong credentials`,
    });
  }
});

module.exports = router;
