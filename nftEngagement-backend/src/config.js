// src/config.js
require('dotenv').config();

module.exports = {
  DB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-socialEngagement',
  PORT: process.env.PORT || 5000,
  ALGOD_CONFIG: {
    token: process.env.ALGOD_TOKEN || '',
    server: process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
    port: process.env.ALGOD_PORT || ''
  }
};