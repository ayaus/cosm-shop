const User = require("../models/User");
const decodeJwt = require("../decodeJwt");


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Ошибка получения профиля", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    const userId = decodeJwt(token)?.userId; // используй свою функцию

    const user = await User.findByIdAndUpdate(userId, {
      name, email, avatar
    }, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "✅ Обновлено", user });
  } catch (err) {
    console.error("Ошибка обновления профиля:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
