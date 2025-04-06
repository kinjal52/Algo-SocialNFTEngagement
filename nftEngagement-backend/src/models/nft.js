const mongoose = require('mongoose');

const NFTSchema = new mongoose.Schema({
    id: { type: Number, required: false, unique: false },
    name: { type: String, required: false },
    ownerAddress: { type: String, required: false }, // Algorand address of owner
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NFT', NFTSchema);