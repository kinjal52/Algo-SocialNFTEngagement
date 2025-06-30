const YAML = require('yamljs');
const path = require('path');

// Merge multiple YAML files
const nftDocs = YAML.load(path.join(__dirname, 'nft.yaml'));
const chatDocs = YAML.load(path.join(__dirname, 'chat.yaml'));

// Basic template
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Algorand NFT Marketplace API",
    version: "1.0.0",
    description: "API docs for NFT minting and NFT chat/Q&A",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
  paths: {
    ...nftDocs.paths,
    ...chatDocs.paths,
  },
};

module.exports = swaggerDocument;
