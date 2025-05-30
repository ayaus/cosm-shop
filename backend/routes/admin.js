const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const User = require("../models/User");
const Order = require("../models/Order");

router.get("/users", auth, checkRole("superadmin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.put("/users/:id/role", auth, checkRole("superadmin"), async (req, res) => {
  const { role } = req.body;

  if (!["user", "admin", "superadmin"].includes(role)) {
    return res.status(400).json({ message: "Неверная роль" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");

  res.json({ message: "Роль обновлена", user });
});
router.patch("/orders/:id", auth, checkRole("admin", "superadmin"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Заказ не найден" });

    res.json({ message: "Статус обновлён", order: updated });
  } catch (err) {
    console.error("Ошибка обновления заказа:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
