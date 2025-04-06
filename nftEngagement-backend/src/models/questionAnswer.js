// src/models/questionAnswer.js
const mongoose = require('mongoose');

const QuestionAnswerSchema = new mongoose.Schema({
  questionId: { type: Number, required: false },
  assetId: { type: String, required: false },
  askerAddress: { type: String, required: false },
  ownerAddress: { type: String, required: false },
  question: { type: String, required: false },
  answer: { type: String },
  createdAt: { type: Date, default: Date.now },
  answeredAt: { type: Date },
  // isAnswered: { type: Boolean, default: false }
});

module.exports = mongoose.model('QuestionAnswer', QuestionAnswerSchema);