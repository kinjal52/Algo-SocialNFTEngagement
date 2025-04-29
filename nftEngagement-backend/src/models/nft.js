const mongoose = require('mongoose');

const NFTSchema = new mongoose.Schema({
  nftId: { type: mongoose.Schema.Types.ObjectId, ref: "NFT", required: true }, // 👈 ADD THIS
  name: { type: String, required: true },
  description: { type: String },
  price:{ type: Number, default: 0 }, 
  ownerAddress: { type: String, required: true }, // Seller Wallet Address
  image: { type: String, required: true }, // 🔥 New field for image URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NFT', NFTSchema);
