class CustomError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

class ValidationError extends Error {
  statusCode = 400;

  constructor(errors, message) {
    super();
    this.errors = errors;
    this.message = message;
  }

  formatErrors() {
    return this.errors.map((err) => ({ [err.param]: err.msg }));
  }
}

const handleErrorResponse = (err, res) => {
  const { statusCode, message } = err;
  if (err instanceof CustomError) {
    return res.status(statusCode).json({
      status: false,
      statusCode,
      message,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(statusCode).json({
      status: false,
      statusCode,
      message,
      errors: err.formatErrors(),
    });
  }

  res.status(400).json({
    status: false,
    message: err.message || "Something went wrong",
  });
};

module.exports = { CustomError, handleErrorResponse, ValidationError };
