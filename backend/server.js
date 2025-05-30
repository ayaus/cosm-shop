const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const Message = require("./models/Message");
const ordersRoutes = require("./routes/orders"); 

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS,PATCH");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", require("./routes/orders"));
app.use("/api/addresses", require("./routes/addresses"));
app.use("/api/admin", require("./routes/admin")); 


const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("💬 Пользователь подключился:", socket.id);

  socket.on("chatMessage", async (msg) => {
    console.log("📥 Получено сообщение:", msg);
    await Message.create({ sender: "user", text: msg });

    let response = "🤖 Извините, я вас не понял.";
    if (msg.toLowerCase().includes("привет")) response = "Привет! Чем могу помочь?";
    if (msg.toLowerCase().includes("доставка")) response = "🚚 Доставка по Алматы 1-2 дня.";
    if (msg.toLowerCase().includes("оплата")) response = "💳 Оплата доступна через Kaspi и Халык.";

    await Message.create({ sender: "bot", text: response });
    socket.emit("botReply", response);
  });

  socket.on("disconnect", () => {
    console.log("❌ Пользователь отключился:", socket.id);
  });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
