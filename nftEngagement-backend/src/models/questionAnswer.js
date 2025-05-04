const mongoose = require('mongoose');

const questionAnswerSchema = new mongoose.Schema({
  nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'NFT', required: true },
  assetId: { type: String, required: false },
  askerAddress: { type: String, required: true },
  ownerAddress: { type: String, required: true },
  message: { type: String, required: true },
  isSellerResponse: { type: Boolean, default: false },
  algorandTxId: { type: String, default: null }
}, { timestamps: { createdAt: 'sentAt' } });

module.exports = mongoose.model('QuestionAnswer', questionAnswerSchema);