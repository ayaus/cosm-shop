const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId}).populate("products.productId");
    res.json(cart || { products: [] });
  } catch (err) {
    console.error("Ошибка получения корзины:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { productId } = req.body; 
    let cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.userId,
        products: [{ productId, quantity: 1 }],
      });
    } else {
      const item = cart.products.find(p => p.productId.toString() === productId);
      if (item) {
        item.quantity += 1;
      } else {
        cart.products.push({ productId, quantity: 1 });
      }
      await cart.save();
    }

    res.status(201).json({ message: "Товар добавлен в корзину" });
  } catch (err) {
    console.error("Ошибка добавления в корзину:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) return res.status(404).json({ message: "Корзина не найдена" });

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();

    res.json({ message: "Товар удалён из корзины" });
  } catch (err) {
    console.error("Ошибка удаления товара:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


router.patch("/:productId", auth, async (req, res) => {
  try {
    const { quantityDelta } = req.body;
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) return res.status(404).json({ message: "Корзина не найдена" });

    const item = cart.products.find(p => p.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Товар не найден в корзине" });

    item.quantity += quantityDelta;

    if (item.quantity <= 0) {
      cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    }

    await cart.save();
    res.json({ message: "Количество обновлено" });
  } catch (err) {
    console.error("Ошибка обновления количества:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
