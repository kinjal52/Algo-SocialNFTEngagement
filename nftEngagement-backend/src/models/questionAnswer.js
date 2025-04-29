const mongoose = require("mongoose");
const nft = require("./nft");

const questionAnswer = new mongoose.Schema({
  nftId: { type: mongoose.Schema.Types.ObjectId, ref: "NFT", required: true }, // 👈 ADD THIS
  askerAddress: { type: String, required: true },
  recipientAddress: { type: String, required: false },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  ownerAddress :{ type: String, required: true },
  isSellerResponse: { type: Boolean, default: false },
});

module.exports = mongoose.model("Message", questionAnswer);