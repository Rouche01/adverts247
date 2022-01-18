const errorFormatter = (errs) => {
  return errs.map((err) => {
    return { [err.param]: err.msg };
  });
};

module.exports = { errorFormatter };
