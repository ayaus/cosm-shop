const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🧪 Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Нет токена" });
  }

  const token = authHeader.split(" ")[1]; 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log("✅ JWT decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ JWT ошибка:", err.message);
    return res.status(401).json({ message: "Неверный токен" });
  }
};


module.exports = authMiddleware;
