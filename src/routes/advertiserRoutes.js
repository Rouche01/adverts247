const express = require("express");
const router = express.Router();
const { query, body } = require("express-validator");
const { omitBy, isNil } = require("lodash");
const kebabCase = require("lodash/kebabCase");

const requireAuth = require("../middlewares/requireAuth");
const checkRole = require("../middlewares/checkRole");
const validateRequest = require("../middlewares/validateRequest");

const { Advertiser } = require("../models/Advertiser");
const { ADMIN } = require("../constants/roles");

const { CustomError } = require("../utils/error");
const { generateHashId } = require("../utils/generateHashId");

router.use(requireAuth);
router.use(checkRole(ADMIN));

router.post(
  "/advertisers",
  body("companyName").isString().withMessage("Company name is required"),
  validateRequest,
  async (req, res) => {
    const { companyName } = req.body;

    const advertiserExists = await Advertiser.findOne({ companyName });
    if (advertiserExists)
      throw new CustomError(404, "Advertiser exists already");

    const advertiserId = generateHashId({ prefix: "CU", length: 7 });

    const advertiser = new Advertiser({
      advertiserId,
      email: `${advertiserId.toLowerCase()}@${kebabCase(
        companyName
      )}.adverts247.com`,
      password: process.env.ADVERTISERS_DEFAULT_PASSWORD,
      companyName,
    });

    await advertiser.save();
    res.send(advertiser);
  }
);

router.get(
  "/advertisers",
  query("startsWith").optional().isString(),
  query("limit").optional().isNumeric(),
  query("skip").optional().isNumeric(),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "adBudget"])
    .withMessage("You can only sort by createdAt"),
  query("orderBy").optional().isIn(["desc", "asc"]),
  validateRequest,
  async (req, res) => {
    const { startsWith, limit, skip, sortBy, orderBy } = req.query;
    const regexp = startsWith && new RegExp(`^${startsWith}`, "i");

    const sort = {};
    const filterOpt = omitBy({ companyName: regexp }, isNil);
    let paginationOptions = omitBy({ limit, skip }, isNil);

    Object.entries(paginationOptions).forEach(
      ([key, val]) => (paginationOptions[key] = parseInt(val))
    );

    if (sortBy && orderBy) {
      sort[sortBy] = orderBy === "desc" ? -1 : 1;
    }

    const count = await Advertiser.find(filterOpt, null).countDocuments();

    const advertisers = await Advertiser.find(filterOpt, null, {
      ...paginationOptions,
      sort,
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
