const { initializeDatabase } = require("./db/db.connect");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const Messages = require("./models/Messages.models");
const User = require("./models/user.models");
require("dotenv").config();
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://nova-chat-sigma.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["http://localhost:3000", "https://nova-chat-sigma.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

initializeDatabase();

app.use("/auth", authRoutes);

//socket io
io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("send_message", async (data) => {
    const { sender, receiver, message } = data;

    const newMessage = new Messages({ sender, receiver, message });
    const savedMessage = await newMessage.save();
    socket.broadcast.emit("receive_message", savedMessage);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("user_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

app.get("/messages", async (req, res) => {
  const { sender, receiver } = req.query;

  try {
    const messages = await Messages.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

app.get("/users", async (req, res) => {
  const { currentUser } = req.query;

  try {
    const users = await User.find({ username: { $ne: currentUser } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users." });
  }
});
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
