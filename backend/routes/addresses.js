const express = require("express");
const router = express.Router();
const Address = require("../models/Address");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.userId });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении адресов" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { label, details } = req.body;
  try {
    const address = await Address.create({
      user: req.user.userId,
      label,
      details,
    });
    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ message: "Ошибка при добавлении адреса" });
  }
});

module.exports = router;
