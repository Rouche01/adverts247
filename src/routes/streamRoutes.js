const express = require("express");
const router = express.Router();

const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const { Driver } = require("../models/Driver");

const { getOrSetFallback, updateKeyValue } = require("../utils/redisClient");
const { OFF, ON, STREAM_STATUS } = require("../constants/streaming");
const { DRIVER } = require("../constants/roles");

router.get(
  "/stream/:driverId",
  requireAuth,
  checkRole(DRIVER),
  async (req, res) => {
    const { driverId } = req.params;

    try {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({
          status: false,
          message: "This driver does not exist",
        });
      }

      const streamStatus = await getOrSetFallback(driverId, STREAM_STATUS, OFF);

      res.status(200).json({
        status: true,
        data: { streamStatus },
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Failed to retrieve stream status",
      });
    }
  }
);

router.post(
  "/stream/:driverId",
  requireAuth,
  checkRole(DRIVER),
  async (req, res) => {
    const { driverId } = req.params;

    try {
      const driver = await Driver.findById(driverId);

      if (!driver) {
        return res.status(404).json({
          status: false,
          message: "This driver does not exist",
        });
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
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Failed to toggle streaming status",
      });
    }
  }
);

module.exports = router;
