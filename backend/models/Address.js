const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  label: { type: String, required: true },     
  details: { type: String, required: true },   
});

module.exports = mongoose.model("Address", addressSchema);
