module.exports = (requiredRole) => (req, res, next) => {
  const { kind } = req.user || { kind: "driver" };

  const allowed = Array.isArray(requiredRole)
    ? requiredRole.includes(kind.toLowerCase())
    : kind.toLowerCase() === requiredRole.toLowerCase();

  if (!allowed) {
    return res.status(401).send({
      errors: "You do not have the required authorization to access this route",
    });
  }

  next();
};
