const { handleErrorResponse } = require("../utils/error");

const errorHandler = (err, _req, res, _next) => {
  handleErrorResponse(err, res);
};

module.exports = { errorHandler };
