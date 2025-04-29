const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { DB_URI } = require("./config");
const path = require('path');

require("dotenv").config();


const app = express();
app.use(cors({
    origin: 'http://localhost:3001' // Explicitly allow frontend
  }));app.use(express.json());

const backendRoot = path.join(__dirname, '..'); 

console.log("Root Directory:", backendRoot);
app.use('/uploads', express.static(path.join(backendRoot, 'uploads')));

// Connect to MongoDB
mongoose
    .connect(DB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Routes
const nftRoutes = require("./routes/nftRoutes");
app.use("/api/nft", nftRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));