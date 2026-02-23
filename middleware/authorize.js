// middleware/authorize.js
// req.user is added by passport-jwt after successful authentication

module.exports = function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send("Access denied. No user.");

    if (allowedRoles.length === 0) return next();

    if (!allowedRoles.includes(req.user.role))
      return res.status(403).send("Access denied. Forbidden.");

    next();
  };
};
