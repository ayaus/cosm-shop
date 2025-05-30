const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    if (!name || !price || !image || !category) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    const product = new Product({ name, description, price, image, category });
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при создании товара", error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении товаров", error: err.message });
  }
};
// Обновление товара
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Товар не найден" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при обновлении товара", error: err.message });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Товар не найден" });
    res.json({ message: "Товар удалён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка при удалении товара", error: err.message });
  }
};



// Получение одного товара по ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Товар не найден" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении товара", error: err.message });
  }
};
