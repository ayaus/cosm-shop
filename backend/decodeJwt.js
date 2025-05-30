const jwt = require("jsonwebtoken");

function decodeJwt(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Ошибка JWT:", err.message);
    return null;
  }
}

module.exports = decodeJwt;
