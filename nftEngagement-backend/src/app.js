const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // 
const { Server } = require("socket.io"); 
const { DB_URI } = require("./config");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());



const backendRoot = path.join(__dirname, "..");
app.use("/uploads", express.static(path.join(backendRoot, "uploads")));

// Connect to MongoDB
mongoose
  .connect(DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use((req, res, next) => {
  req.io = io; // Attach `io` to the request object
  next();
});

// Routes
const nftRoutes = require("./routes/nftRoutes");
app.use("/api/nft", nftRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  socket.on('join-room', (nftId) => {
    socket.join(nftId);
    console.log(`User joined room ${nftId}`);
  });
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
