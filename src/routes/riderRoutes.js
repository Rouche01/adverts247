const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");
const deleteTriviaSessions = require("../middlewares/deleteRelatedSessions");

const { Rider } = require("../models/Rider");
const { riderFields } = require("../utils/required-fields");
const { classifyFieldFormat } = require("../utils/required-fields");

const validateRequest = require("../middlewares/validateRequest");
const { CustomError } = require("../utils/error");

router.post(
  "/riders",
  requireAuth,
  body(classifyFieldFormat(riderFields, "email")).isEmail(),
  body(classifyFieldFormat(riderFields, "string")).isString(),
  validateRequest,
  async (req, res) => {
    const { fullname, email, phoneNumber } = req.body;

    const newRider = new Rider({
      fullname,
      email,
      phoneNumber,
    });

    const rider = await newRider.save();
    res.status(200).json({
      status: true,
      message: "New rider registered successfully!",
      rider,
    });
  }
);

router.get("/riders", requireAuth, async (req, res) => {
  const riders = await Rider.find();
  const number = riders.length;
  res.status(200).json({
    status: true,
    riders,
    number,
  });
});

router.get("/rider/:riderEmail", async (req, res) => {
  const { riderEmail } = req.params;

  const riderExist = await Rider.findOne({ email: riderEmail });
  if (!riderExist) {
    return res.status(200).json({
      existStatus: false,
      message: "This rider does not exist",
    });
  }
  res.status(200).json({
    existStatus: true,
    rider: riderExist,
  });
});

router.delete("/rider/:riderId", deleteTriviaSessions, async (req, res) => {
  const { riderId } = req.params;

  const riderExist = await Rider.findById(riderId);
  if (!riderExist) {
    return res.status(404).json({
      status: false,
      message: "This rider does not exist",
    });
  }
  await Rider.deleteOne({ _id: rider_id });
  res.status(200).json({
    status: true,
    message: "Rider deleted successfully",
    deletedRider: riderExist,
  });
});

router.patch("/rider/:riderId", async (req, res) => {
  const { phoneNumber, fullname } = req.body;

  if (!phoneNumber && !fullname) {
    throw new CustomError(400, "No data in body");
  }

  const riderExist = await Rider.findById(req.params.riderId);
  if (!riderExist) {
    throw new CustomError(404, "Rider does not exist");
  }

  let newValues = { $set: {} };
  const updatables = { phoneNumber, fullname };

  for (const key in updatables) {
    if (updatables[key]) {
      newValues.$set[key] = updatables[key];
    }
  }

  const response = await Rider.updateOne(
    { _id: req.params.rider_id },
    newValues
  );
  res.status(200).json({
    status: true,
    message: "Rider updated successfully",
    data: response,
  });
});

module.exports = router;
