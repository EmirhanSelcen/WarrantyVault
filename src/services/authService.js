const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { getDb } = require("../db/database");
const { createHttpError } = require("../utils/errors");
const { validateRegistration, validateLogin } = require("../utils/validators");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || "development_secret",
    { expiresIn: "2h" }
  );
}

async function registerUser(input) {
  const errors = validateRegistration(input);
  if (errors.length > 0) {
    throw createHttpError(400, errors.join(" "));
  }

  const db = getDb();
  const existingUser = await db.get("SELECT id FROM users WHERE email = ?", input.email.toLowerCase());
  if (existingUser) {
    throw createHttpError(409, "Email is already registered.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const result = await db.run(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    input.name.trim(),
    input.email.toLowerCase().trim(),
    passwordHash
  );

  const user = {
    id: result.lastID,
    name: input.name.trim(),
    email: input.email.toLowerCase().trim()
  };

  return { user, token: signToken(user) };
}

async function loginUser(input) {
  const errors = validateLogin(input);
  if (errors.length > 0) {
    throw createHttpError(400, errors.join(" "));
  }

  const db = getDb();
  const user = await db.get("SELECT * FROM users WHERE email = ?", input.email.toLowerCase().trim());
  if (!user) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password_hash);
  if (!passwordMatches) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const safeUser = { id: user.id, name: user.name, email: user.email };
  return { user: safeUser, token: signToken(safeUser) };
}

module.exports = { registerUser, loginUser };
