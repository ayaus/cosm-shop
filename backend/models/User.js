const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },  
  avatar: { type: String, default: "" },
  loyaltyPoints: { type: Number, default: 0 }, 
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
