const requestIp = require("request-ip");

const clientIp = (req, res, next) => {
  req.clientIp = requestIp.getClientIp(req);
  next();
};

module.exports = { clientIp };
