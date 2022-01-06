const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { Driver } = require("../models/Driver");
const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");

// @route get /driver
// @desc Get a user with the token sent along the request
// @access Private
router.get("/driver", requireAuth, checkRole("driver"), (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({
      error: "User does not exist",
    });
  }
  res.status(200).send({
    user,
  });
});

// @route get /drivers
// @desc Get all users
// @access Public
router.get("/drivers", requireAuth, checkRole("admin"), async (req, res) => {
  try {
    const drivers = await Driver.find({ kind: "Driver" });
    res.status(200).send({
      drivers,
    });
  } catch (err) {
    res.status(400).json({
      error: "There was an error retrieving the users",
    });
  }
});

router.get(
  "/driver/:driver_id",
  requireAuth,
  checkRole("admin"),
  async (req, res) => {
    const { driver_id } = req.params;

    try {
      const driver = await Driver.findOne({ _id: driver_id });

      if (!driver) {
        return res.status(404).json({
          status: false,
          message: "This driver does not exist",
        });
      }

      res.status(200).json({
        status: true,
        driver,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
      });
    }
  }
);

// @route patch /drivers/:id
// @desc update a driver's details
// @access Private
router.patch("/drivers/:id", requireAuth, async (req, res) => {
  const {
    profilePhoto,
    driversLicense,
    insuranceCert,
    vehicleReg,
    email,
    phoneNumber,
    bankInformation,
    withdrawalCode,
  } = req.body;
  if (
    !profilePhoto &&
    !driversLicense &&
    !insuranceCert &&
    !vehicleReg &&
    !email &&
    !phoneNumber &&
    !bankInformation &&
    !withdrawalCode
  ) {
    return res.status(400).send({
      error: "No update was sent",
    });
  }

  if (!req.params.id) {
    return res.status(400).json({
      error: "Driver id is required",
    });
  }

  const driver = await Driver.findOne({ _id: req.params.id });

  if (!driver) {
    return res.status(404).send({
      error: "Driver does not exist.",
    });
  }

  let newValues = { $set: {} };

  if (profilePhoto) {
    newValues.$set.profilePhoto = profilePhoto;
  }

  if (driversLicense) {
    newValues.$set.driversLicense = driversLicense;
  }

  if (insuranceCert) {
    newValues.$set.insuranceCert = insuranceCert;
  }

  if (vehicleReg) {
    newValues.$set.vehicleReg = vehicleReg;
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

  try {
    const response = await Driver.updateOne({ _id: driver._id }, newValues);
    res.status(200).send({
      message: "Driver updated successfully",
      data: response,
    });
  } catch (err) {
    res.status(400).send({
      error: "Unable to update the user",
    });
  }
});

router.patch(
  "/driver/:driver_id/switch-stream",
  requireAuth,
  checkRole("driver"),
  async (req, res) => {
    const { driver_id } = req.params;

    try {
      const driverExist = await Driver.findOne({ _id: driver_id });

      if (!driverExist) {
        return res.status(404).json({
          status: false,
          message: "This driver does not exist",
        });
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
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;
