const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is not defined in .env");
  }
  return jwt.sign(
    { email: user.email, id: user._id, role: user.role },
    process.env.JWT_KEY,
    { expiresIn: "1d" }
  );
};

module.exports.generateToken = generateToken;
