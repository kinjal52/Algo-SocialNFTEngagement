const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { DB_URI } = require("./config");

require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(DB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Routes
const qaRoutes = require("./routes/nftRoutes");
app.use("/api/qa", qaRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));