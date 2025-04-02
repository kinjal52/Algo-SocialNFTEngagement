// src/models/questionAnswer.js
const mongoose = require('mongoose');

const QuestionAnswerSchema = new mongoose.Schema({
  assetId: { type: Number, required: true },
  askerAddress: { type: String, required: true },
  ownerAddress: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String },
  createdAt: { type: Date, default: Date.now },
  answeredAt: { type: Date },
  isAnswered: { type: Boolean, default: false }
});

module.exports = mongoose.model('QuestionAnswer', QuestionAnswerSchema);