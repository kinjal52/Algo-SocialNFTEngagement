const mongoose = require('mongoose');

const nftSchema = new mongoose.Schema({
  assetId: { type: String, required: false, unique: true },
  name: { type: String, default: 'Unnamed NFT' },
  url: { type: String, default: null },
  creator: { type: String, required: true },
  ownerAddress: { type: String, required: true },
  balance: { type: Number, default: 1 },
  description: { type: String, default: 'No description available' },
  verified: { type: Boolean, default: false },
  minting: { type: String, default: 'Algorand Testnet' },
  price: { type: String, default: '0 ALGO' },
  transactionId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('NFT', nftSchema);