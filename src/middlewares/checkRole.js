module.exports = (requiredRole) => (req, res, next) => {
  const { kind } = req.user || { kind: "driver" };

  if (
    kind.toLowerCase() !== requiredRole.toLowerCase() ||
    !requiredRole.includes(kind.toLowerCase())
  ) {
    return res.status(401).send({
      errors: "You do not have the required authorization to access this route",
    });
  }

  next();
};
