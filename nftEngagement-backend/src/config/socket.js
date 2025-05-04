// socket.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // change to your frontend URL in production
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join room using wallet address
  socket.on("join", (walletAddress) => {
    socket.join(walletAddress);
    console.log(`Socket ${socket.id} joined room ${walletAddress}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Export notification function
const notifyNewMessage = (walletAddress, message) => {
  io.to(walletAddress).emit("new_message", message);
};

module.exports = {
  httpServer,
  notifyNewMessage,
};
