const express = require("express");
const router = express.Router();
const { omitBy, isNil } = require("lodash");

const { Driver } = require("../models/Driver");
const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const { CustomError } = require("../utils/error");
const { ADMIN, DRIVER } = require("../constants/roles");
const { query, body } = require("express-validator");

const {
  DRIVER_STATUS: { APPROVED, PENDING, SUSPENDED },
} = require("../constants/driver");
const validateRequest = require("../middlewares/validateRequest");

// @route get /driver
// @desc Get a user with the token sent along the request
// @access Private
router.get("/driver", requireAuth, checkRole(DRIVER), (req, res) => {
  const user = req.user;
  if (!user) {
    throw new CustomError(404, "User does not exist");
  }
  res.status(200).send({
    user,
  });
});

// @route get /drivers
// @desc Get all users
// @access Public
router.get(
  "/drivers",
  requireAuth,
  checkRole(ADMIN),
  query("status").optional().isIn([APPROVED, PENDING, SUSPENDED]),
  query("limit").optional().isNumeric(),
  query("skip").optional().isNumeric(),
  query("sortBy")
    .optional()
    .isIn(["createdAt"])
    .withMessage("You can only sort by createdAt"),
  query("orderBy").optional().isIn(["desc", "asc"]),
  validateRequest,
  async (req, res) => {
    const { status, limit, skip, sortBy, orderBy } = req.query;

    const sort = {};
    const filterOptions = status ? { status } : {};
    let paginationOptions = omitBy({ limit, skip }, isNil);

    Object.entries(paginationOptions).forEach(
      ([key, val]) => (paginationOptions[key] = parseInt(val))
    );

    if (sortBy && orderBy) {
      sort[sortBy] = orderBy === "desc" ? -1 : 1;
    }

    const count = await Driver.find(filterOptions, null, {
      sort,
    }).countDocuments();

    const drivers = await Driver.find(filterOptions, null, {
      ...paginationOptions,
      sort,
    });

    res.status(200).send({
      drivers,
      size: count,
    });
  }
);

router.get(
  "/driver/:driverId",
  requireAuth,
  checkRole([ADMIN, DRIVER]),
  async (req, res) => {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    console.log(driver);

    if (!driver) {
      throw new CustomError(404, "This driver does not exist");
    }

    res.status(200).json({
      status: true,
      driver,
    });
  }
);

// @route patch /drivers/:id
// @desc update a driver's details
// @access Private
router.patch("/drivers/:id", requireAuth, async (req, res) => {
  const {
    profilePhoto,
    driversValidId,
    email,
    phoneNumber,
    bankInformation,
    withdrawalCode,
  } = req.body;
  if (
    !profilePhoto &&
    !driversValidId &&
    !email &&
    !phoneNumber &&
    !bankInformation &&
    !withdrawalCode
  ) {
    throw new CustomError(400, "No update was sent");
  }

  if (!req.params.id) {
    throw new CustomError(400, "Driver id is required");
  }

  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    throw new CustomError(404, "Driver does not exist.");
  }

  let newValues = { $set: {} };

  if (profilePhoto) {
    newValues.$set.profilePhoto = profilePhoto;
  }

  if (driversValidId) {
    newValues.$set.driversValidId = driversValidId;
  }

  if (email) {
    newValues.$set.email = email;
  }

  if (phoneNumber) {
    newValues.$set.phoneNumber = phoneNumber;
  }

  if (bankInformation) {
    newValues.$set.bankInformation = bankInformation;
  }

  if (withdrawalCode) {
    newValues.$set.withdrawalCode = withdrawalCode;
  }

  const response = await Driver.updateOne({ _id: driver._id }, newValues);
  res.status(200).send({
    message: "Driver updated successfully",
    data: response,
  });
});

router.patch(
  "/driver/:driverId/switch-stream",
  requireAuth,
  checkRole(DRIVER),
  async (req, res) => {
    const { driverId } = req.params;

    const driverExist = await Driver.findById(driverId);

    if (!driverExist) {
      throw new CustomError(404, "This driver does not exist");
    }

    const { deviceStatus } = driverExist;
    // console.log(deviceStatus);
    let newValues = { $set: {} };

    if (deviceStatus === "off") {
      newValues.$set.deviceStatus = "on";
    } else if (deviceStatus === "on") {
      newValues.$set.deviceStatus = "off";
    }

    const response = await Driver.updateOne({ _id: driver_id }, newValues);

    res.status(200).json({
      status: true,
      message: "Driver device updated successfully",
      data: response,
    });
  }
);

router.patch(
  "drivers/change-status/",
  requireAuth,
  checkRole(ADMIN),
  query("driver")
    .isString()
    .withMessage("Driver id is required as query param"),
  body("status").isIn([PENDING, APPROVED, SUSPENDED]),
  validateRequest,
  async (req, res) => {
    const { driver: driverId } = req.query;
    const { status } = req.body;

    const driver = await Driver.findOne({ _id: driverId });
    if (!driver) throw new CustomError(404, "Driver does not exist");

    driver.status = status;
    await driver.save();

    res.send({ message: "Updated driver status successfully", driver });
  }
);

module.exports = router;
