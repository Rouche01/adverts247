const express = require("express");
const router = express.Router();
const { query } = require("express-validator");
const { omitBy, isNil } = require("lodash");

const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");

const { Advertiser } = require("../models/Advertiser");
const { ADMIN } = require("../constants/roles");

const { CustomError } = require("../utils/error");

router.use(requireAuth);
router.use(checkRole(ADMIN));

router.get(
  "/advertisers",
  query("startsWith").optional().isString(),
  query("limit").optional().isNumeric(),
  query("skip").optional().isNumeric(),
  validateRequest,
  async (req, res) => {
    const { startsWith, limit, skip } = req.query;
    const regexp = startsWith && new RegExp(`^${startsWith}`, "i");

    const filterOpt = omitBy({ companyName: regexp }, isNil);
    let paginationOptions = omitBy({ limit, skip }, isNil);

    Object.entries(paginationOptions).forEach(
      ([key, val]) => (paginationOptions[key] = parseInt(val))
    );

    const count = await Advertiser.find(filterOpt, null).count();

    const advertisers = await Advertiser.find(filterOpt, null, {
      ...paginationOptions,
    }).populate({
      path: "campaigns",
      select: ["campaignStat", "duration"],
      populate: { path: "campaignStat" },
    });

    res.send({ advertisers, size: count });
  }
);

router.get("/advertisers/:advertiserId", async (req, res) => {
  const { advertiserId } = req.params;

  const advertiser = await Advertiser.findOne({ advertiserId }).populate({
    path: "campaigns",
    select: ["campaignStat", "duration"],
    populate: { path: "campaignStat" },
  });

  if (!advertiser) throw new CustomError(404, "Advertiser does not exist");
  res.send(advertiser);
});

module.exports = router;
