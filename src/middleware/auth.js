const jwt = require("jsonwebtoken");
const { createHttpError } = require("../utils/errors");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(createHttpError(401, "Authentication token is required."));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "development_secret");
    return next();
  } catch (error) {
    return next(createHttpError(401, "Invalid or expired token."));
  }
}

module.exports = { requireAuth };
