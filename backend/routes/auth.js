const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User"); 

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log("✅ req.user:", req.user);
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    res.json(user);
  } catch (err) {
    console.error("❌ Ошибка в /me:", err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
});

module.exports = router;
