const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const Address = require("../models/Address");


router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Ошибка получения заказов" });
  }
});

router.get("/admin", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "superadmin") {
        return res.status(403).json({ message: "Нет доступа" });
      }
  
      const orders = await Order.find()
        .populate("user", "name email") 
        .populate("items.product");
  
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Ошибка получения заказов" });
    }
  });
  
router.patch("/admin/orders/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "superadmin") {
        return res.status(403).json({ message: "Нет доступа" });
      }
  
      const { id } = req.params;
      const { status } = req.body;
  
      const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  
      if (!order) return res.status(404).json({ message: "Заказ не найден" });
  
      res.json({ message: "Статус обновлён", order });
    } catch (err) {
      console.error("Ошибка обновления статуса:", err);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
  
router.post("/", authMiddleware, async (req, res) => {
    const { items, address } = req.body;
  
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Нет товаров в заказе" });
    }
  
    try {
      const order = await Order.create({
        user: req.user.userId,
        items,
        address: address || "Самовывоз",
      });
  
      if (address && address !== "Самовывоз") {
        const exists = await Address.findOne({
          user: req.user.userId,
          details: address,
        });
  
        if (!exists) {
          await Address.create({
            user: req.user.userId,
            label: "Адрес из заказа",
            details: address,
          });
        }
      }
  
      res.status(201).json({ message: "Заказ создан", order });
    } catch (err) {
      console.error("Ошибка создания заказа:", err);
      res.status(500).json({ message: "Ошибка создания заказа" });
    }
  });

module.exports = router;
