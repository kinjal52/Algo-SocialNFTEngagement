const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // 
const { Server } = require("socket.io"); 
const { DB_URI } = require("./config");
const path = require("path");
require("dotenv").config();
const { initSocket } = require('./socket');
const { getIO } = require('./socket');


const app = express();
const server = http.createServer(app); 

initSocket(server);


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
  req.io = getIO();
  next();
});

// Routes
const nftRoutes = require("./routes/nftRoutes");
app.use("/api/nft", nftRoutes);

// Start the server
const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
