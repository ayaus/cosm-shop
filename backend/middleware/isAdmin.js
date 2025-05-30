const User = require("../models/User");
const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Нет доступа (только для админов)" });
  }
  next();
};

module.exports = isAdmin;
