const { validationResult } = require("express-validator");
const { ValidationError } = require("../utils/error");

module.exports = (req, res, next) => {
  const error = validationResult(req);
  const hasErrors = !error.isEmpty();

  if (hasErrors) {
    throw new ValidationError(error.errors, "You are entering wrong data.");
  }

  next();
};
