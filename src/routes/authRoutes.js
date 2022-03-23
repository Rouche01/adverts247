const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { Driver } = require("../models/Driver");
const { Admin } = require("../models/Admin");
const { Advertiser } = require("../models/Advertiser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  advertiserRegisterFields,
  classifyFieldFormat,
  driverRegisterFields,
  loginFields,
  adminRegisterFields,
} = require("../utils/required-fields");
const { CustomError } = require("../utils/error");

const validateRequest = require("../middlewares/validateRequest");

router.post(
  "/drivers/signup",
  body(classifyFieldFormat(driverRegisterFields, "string")).isString(),
  body(classifyFieldFormat(driverRegisterFields, "email")).isEmail(),
  body(classifyFieldFormat(driverRegisterFields, "object")).isObject(),
  body(classifyFieldFormat(driverRegisterFields, "password")).isLength({
    min: 8,
    max: 22,
  }),
  validateRequest,
  async (req, res) => {
    const { email, name, phoneNumber, password, city, extraInfo, inviteCode } =
      req.body;

    const existingDriverWithEmail = await Driver.findOne({ email });

    if (existingDriverWithEmail) {
      throw new CustomError(400, "Driver with this email exists already");
    }

    const existingDriverWithPhoneNo = await Driver.findOne({ phoneNumber });

    if (existingDriverWithPhoneNo) {
      throw new CustomError(
        400,
        "Driver with this phone number exists already"
      );
    }

    const driver = new Driver({
      email,
      name,
      phoneNumber,
      password,
      city,
      extraInfo,
      inviteCode,
    });

    await driver.save();
    const token = jwt.sign({ userId: driver.id }, process.env.TOKEN_SECRET_KEY);
    res.status(201).send({
      message: "successfully registered!",
      token,
    });
  }
);

router.post(
  "/drivers/signin",
  body(classifyFieldFormat(loginFields, "email")).isEmail(),
  body(classifyFieldFormat(loginFields, "password")).isLength({
    max: 22,
    min: 8,
  }),
  validateRequest,
  async (req, res) => {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });

    if (!driver) {
      throw new CustomError(400, "You are logging with wrong credentials");
    }

    await driver.comparePassword(password);
    const token = jwt.sign({ userId: driver.id }, process.env.TOKEN_SECRET_KEY);

    res.status(200).send({
      message: "User signed in successfully.",
      token,
    });
  }
);

router.post(
  "/admin/signup",
  body(classifyFieldFormat(adminRegisterFields, "email")).isEmail(),
  body(classifyFieldFormat(adminRegisterFields, "string")).isString(),
  body(classifyFieldFormat(adminRegisterFields, "password")).isLength({
    max: 22,
    min: 8,
  }),
  validateRequest,
  async (req, res) => {
    const { email, username, password } = req.body;

    const existingAdminWithUsername = await Admin.findOne({ username });
    if (existingAdminWithUsername) {
      throw new CustomError(400, "This username is not available");
    }

    const existingAdminWithEmail = await Admin.findOne({ email });
    if (existingAdminWithEmail) {
      throw new CustomError(400, "An admin with this email exists already");
    }

    const admin = new Admin({
      email,
      password,
      username,
    });

    await admin.save();
    const token = jwt.sign({ userId: admin.id }, process.env.TOKEN_SECRET_KEY);
    res.status(201).send({
      message: "successfully registered!",
      token,
      user: admin,
    });
  }
);

router.post(
  "/admin/signin",
  body(classifyFieldFormat(loginFields, "email")).isEmail(),
  body(classifyFieldFormat(loginFields, "password")).isLength({
    max: 22,
    min: 8,
  }),
  validateRequest,
  async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new CustomError(
        404,
        `The email address or password that you entered is not valid.`
      );
    }

    await admin.comparePassword(password);
    const token = jwt.sign({ userId: admin.id }, process.env.TOKEN_SECRET_KEY);
    res.status(200).json({
      message: "Admin signed in successfully.",
      token,
      user: admin,
    });
  }
);

router.post(
  "/advertiser/signup",
  body(classifyFieldFormat(advertiserRegisterFields, "string")).isString(),
  body(classifyFieldFormat(advertiserRegisterFields, "email")).isEmail(),
  body(classifyFieldFormat(advertiserRegisterFields, "password")).isLength({
    min: 8,
    max: 22,
  }),
  validateRequest,
  async (req, res) => {
    const { email } = req.body;

    const existingAdvertiser = await Advertiser.findOne({ email });

    if (existingAdvertiser) {
      throw new CustomError("An advertiser with this email already exists");
    }

    const advertiser = new Advertiser({
      ...req.body,
    });

    await advertiser.save();
    const token = jwt.sign(
      { userId: advertiser.id },
      process.env.TOKEN_SECRET_KEY
    );

    res.status(201).send({
      message: "successfully registered!",
      token,
      user: advertiser,
    });
  }
);

router.post(
  "/advertiser/signin",
  body(classifyFieldFormat(loginFields, "email")).isEmail(),
  body(classifyFieldFormat(loginFields, "password")).isLength({
    max: 22,
    min: 8,
  }),
  validateRequest,
  async (req, res) => {
    const { email, password } = req.body;

    const advertiser = await Advertiser.findOne({ email });
    if (!advertiser) {
      throw new CustomError(
        400,
        "The email address or password that you entered is not valid."
      );
    }

    await advertiser.comparePassword(password);
    const token = jwt.sign(
      { userId: advertiser.id },
      process.env.TOKEN_SECRET_KEY
    );
    res.status(200).send({
      message: "Advertiser signed in successfully.",
      token,
      user: advertiser,
    });
  }
);

module.exports = router;
