const { validationResult } = require("express-validator");
const { ValidationError } = require("../utils/error");

module.exports = (req, res, next) => {
  const error = validationResult(req);
  const hasErrors = !error.isEmpty();

  if (hasErrors) {
    throw new ValidationError(
      error.errors,
      "You are not entering all the data required to sign up."
    );
  }

  next();
};
