const express = require("express");
const router = express.Router();

const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const { Driver } = require("../models/Driver");

const { getOrSetFallback, updateKeyValue } = require("../utils/redisClient");
const { OFF, ON, STREAM_STATUS } = require("../constants/streaming");
const { DRIVER } = require("../constants/roles");
const { CustomError } = require("../utils/error");

router.get(
  "/stream/:driverId",
  requireAuth,
  checkRole(DRIVER),
  async (req, res) => {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new CustomError(404, "This driver does not exist");
    }

    const streamStatus = await getOrSetFallback(driverId, STREAM_STATUS, OFF);

    res.status(200).json({
      status: true,
      data: { streamStatus },
    });
  }
);

router.post(
  "/stream/:driverId",
  requireAuth,
  checkRole(DRIVER),
  async (req, res) => {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new CustomError(404, "This driver does not exist");
    }

    const streamStatus = await getOrSetFallback(driverId, STREAM_STATUS, OFF);

    const shouldStream = streamStatus === OFF;

    shouldStream
      ? await updateKeyValue(driverId, STREAM_STATUS, ON)
      : await updateKeyValue(driverId, STREAM_STATUS, OFF);

    res.status(200).json({
      status: true,
      message: "Toggled streaming status",
    });
  }
);

module.exports = router;
