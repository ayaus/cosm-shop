const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  category: { type: String, required: true }, 
},
{ timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
