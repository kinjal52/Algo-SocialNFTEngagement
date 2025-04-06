const mongoose = require('mongoose');
const NFT = require('./models/nft'); // Adjust the path to your NFT model
require('dotenv').config();
const { DB_URI } = require("./config");

const nftData = [
    { assetId: 1, name: "NFT #1", ownerAddress: "0x09787878e2222", description: "Cool NFT" },
    { assetId: 2, name: "NFT #2", ownerAddress: "0x8787878782738", description: "Rare NFT" },
];

mongoose
    .connect(DB_URI)
    .then(async () => {
        console.log('MongoDB connected');
        await NFT.deleteMany({}); // Clear existing NFTs
        await NFT.insertMany(nftData);
        console.log('NFTs seeded');
        process.exit();
    })
    .catch(err => console.log(err));