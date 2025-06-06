
const express = require("express");
const router = express.Router();
const algosdk = require("algosdk");
const NFT = require("../models/nft");
const QuestionAnswer = require("../models/questionAnswer");
const upload = require("../config/multer")
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');


// Handle BigInt serialization
BigInt.prototype.toJSON = function () { return this.toString() };

function getAlgodClient(network = 'testnet') {
  const servers = {
    testnet: 'https://testnet-api.algonode.cloud',
    mainnet: 'https://mainnet-api.algonode.cloud'
  };
  return new algosdk.Algodv2('', servers[network], 443);
}

// router.post('/create-nft', upload.single('image'), async (req, res) => {
//   let txId;
//   try {
//     const {
//       name,
//       unitName,
//       note = "Algorand NFT",
//       network = "testnet",
//       price,
//     } = req.body;

//     // Validate fields
//     if (!name || !unitName || !req.file) {
//       return res.status(400).json({ success: false, error: "Missing required fields or image" });
//     }

//     // Upload to Pinata
//     const filePath = req.file.path;
//     const fileStream = fs.createReadStream(filePath);
//     const data = new FormData();
//     data.append('file', fileStream);

//     const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
//       maxContentLength: Infinity,
//       headers: {
//         ...data.getHeaders(),
//         pinata_api_key: process.env.PINATA_API_KEY,
//         pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
//       }
//     });

//     const ipfsHash = pinataResponse.data.IpfsHash;
//     const assetURL = `ipfs://${ipfsHash}`;

//     // Clean up temp file
//     fs.unlinkSync(filePath);

//     const account = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);
//     console.log("account", account.addr);

//     const algodClient = getAlgodClient(network);
//     const suggestedParams = await algodClient.getTransactionParams().do();

//     const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
//       sender: account.addr,
//       suggestedParams,
//       assetName: name,
//       unitName: unitName,
//       assetURL,
//       manager: account.addr,
//       reserve: account.addr,
//       freeze: account.addr,
//       clawback: account.addr,
//       total: 1,
//       decimals: 0,
//       note: new TextEncoder().encode(note),
//       defaultFrozen: false
//     });

//     const signedTxn = txn.signTxn(account.sk);
//     txId = txn.txID().toString();
//     await algodClient.sendRawTransaction(signedTxn).do();
//     const result = await algosdk.waitForConfirmation(algodClient, txId, 10);

//     if (!result.assetIndex) {
//       throw new Error("Asset creation failed - no asset ID returned");
//     }

//     await NFT.create({
//       assetId: result.assetIndex.toString(),
//       name,
//       url: assetURL,
//       ownerAddress: account.addr.toString(),
//       description: note,
//       minting: 'Algorand Testnet',
//       price: price,
//       creator: account.addr.toString()
//     });

//     res.json({
//       success: true,
//       assetId: result.assetIndex,
//       transactionId: txId,
//       explorerUrl: `https://lora.algokit.io/testnet/asset/${result.assetIndex}`
//     });

//   } catch (error) {
//     console.error(`Error in transaction ${txId || 'N/A'}:`, error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       transactionId: txId || 'N/A',
//     });
//   }
// });


// 2. List all NFTs

router.post('/create-nft', upload.single('image'), async (req, res) => {
  let txId;
  try {
    const {
      name,
      unitName,
      note = "Algorand NFT",
      network = "testnet",
      price,
      creator, // New field from frontend
    } = req.body;

    // Validate fields
    if (!name || !unitName || !req.file || !creator) {
      return res.status(400).json({ success: false, error: "Missing required fields, image, or creator address" });
    }

    // Validate creator address
    if (!algosdk.isValidAddress(creator)) {
      return res.status(400).json({ success: false, error: "Invalid creator address" });
    }

    // Upload to Pinata
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);
    const data = new FormData();
    data.append('file', fileStream);

    const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxContentLength: Infinity,
      headers: {
        ...data.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });

    const ipfsHash = pinataResponse.data.IpfsHash;
    const assetURL = `ipfs://${ipfsHash}`;

    // Clean up temp file
    fs.unlinkSync(filePath);

    const account = algosdk.mnemonicToSecretKey(process.env.MNEMONIC); // Still using backend key for signing
    const algodClient = getAlgodClient(network);
    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      suggestedParams,
      assetName: name,
      unitName: unitName,
      assetURL,
      manager: account.addr,
      reserve: account.addr,
      freeze: account.addr,
      clawback: account.addr,
      total: 1,
      decimals: 0,
      note: new TextEncoder().encode(note),
      defaultFrozen: false,
    });

    const signedTxn = txn.signTxn(account.sk);
    txId = txn.txID().toString();
    await algodClient.sendRawTransaction(signedTxn).do();
    const result = await algosdk.waitForConfirmation(algodClient, txId, 10);

    const assetId = result.assetIndex; // ✅ Extract assetId


    if (!assetId) {
      throw new Error("Asset creation failed - no asset ID returned");
    }

    console.log("assetId", assetId);


    // Transfer to creator (after opt-in)
    const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: creator,
      assetIndex: assetId,
      amount: 1,
      suggestedParams,
    });
    const signedTransferTxn = transferTxn.signTxn(account.sk);
    const transferTxId = transferTxn.txID().toString();
    await algodClient.sendRawTransaction(signedTransferTxn).do();
    await algosdk.waitForConfirmation(algodClient, transferTxId, 10);

    await NFT.create({
      assetId: result.assetIndex.toString(),
      name,
      url: assetURL,
      ownerAddress: creator,
      description: note,
      minting: 'Algorand Testnet',
      price: price,
      creator: creator,
      transactionId: txId
    });

    res.json({
      success: true,
      assetId: result.assetIndex,
      transactionId: txId,
      explorerUrl: `https://lora.algokit.io/testnet/asset/${result.assetIndex}`,
    });
  } catch (error) {
    console.error(`Error in transaction ${txId || 'N/A'}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      transactionId: txId || 'N/A',
    });
  }
});
// backend/routes/nft.js
router.post('/prepare-nft', upload.single('image'), async (req, res) => {
  try {
    const { name, unitName, price, creator } = req.body;

    // Validate fields
    if (!name || !unitName || !req.file || !creator) {
      return res.status(400).json({ success: false, error: "Missing required fields or image" });
    }

    // Upload to Pinata
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);
    const data = new FormData();
    data.append('file', fileStream);

    const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxContentLength: Infinity,
      headers: {
        ...data.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      }
    });

    const ipfsHash = pinataResponse.data.IpfsHash;
    const assetURL = `ipfs://${ipfsHash}`;

    // Clean up temp file
    fs.unlinkSync(filePath);

    // Create unsigned transaction with user's address
    const algodClient = getAlgodClient('testnet');
    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: creator,
      suggestedParams,
      assetName: name,
      unitName: unitName,
      assetURL,
      manager: creator,
      reserve: creator,
      freeze: creator,
      clawback: creator,
      total: 1,
      decimals: 0,
      note: new TextEncoder().encode('Algorand NFT'),
      defaultFrozen: false
    });

    // Encode transaction to base64 for Pera Wallet
    const unsignedTx = Buffer.from(txn.toByte()).toString('base64');
    console.log("Unsigned Transaction:", unsignedTx); // Debug log

    res.json({ unsignedTx, assetURL });
  } catch (error) {
    console.error('Error preparing NFT:', error);
    res.status(500).json({ error: 'Failed to prepare NFT' });
  }
});

// Broadcast signed transaction and save NFT
router.post('/broadcast-nft', async (req, res) => {
  try {
    const { signedTx, assetURL, name, unitName, price, creator } = req.body;
    console.log('Received Request Body:', req.body); // Debug log
    console.log('Signed Transaction (Base64):', signedTx); // Debug log
    console.log('Type of signedTx:', typeof signedTx); // Debug log

    // Validate input
    if (!signedTx || typeof signedTx !== 'string') {
      throw new Error('Invalid signed transaction: must be a non-empty base64-encoded string.');
    }

    // Verify base64 format
    if (!/^[A-Za-z0-9+/=]+$/.test(signedTx)) {
      throw new Error('Invalid base64 string: contains invalid characters.');
    }

    // Decode base64 to Buffer
    let signedTxBuffer;
    try {
      signedTxBuffer = Buffer.from(signedTx, 'base64');
    } catch (error) {
      throw new Error(`Failed to decode base64 string: ${error.message}`);
    }

    const algodClient = getAlgodClient('testnet');

    // Check account balance
    const accountInfo = await algodClient.accountInformation(creator).do();
    console.log('Account Balance (microAlgos):', accountInfo.amount); // Debug balance
    const minBalance = 101000; // Minimum balance for 0.001 ALGO (fee) + 0.1 ALGO (asset creation)
    if (accountInfo.amount < minBalance) {
      throw new Error(`Insufficient balance: Account has ${accountInfo.amount / 1e6} ALGO, requires at least ${minBalance / 1e6} ALGO.`);
    }

    // Broadcast transaction
    console.log('Sending Transaction to Algod...');
    let txIdResponse;
    try {
      txIdResponse = await algodClient.sendRawTransaction(signedTxBuffer).do();
      console.log('SendRawTransaction Response:', txIdResponse); 
    } catch (error) {
      throw new Error(`Failed to broadcast transaction: ${error.message}`);
    }

    const txId = txIdResponse.txid; // Corrected to txid (lowercase)
    if (!txId) {
      throw new Error('No transaction ID returned from sendRawTransaction.');
    }

    // Wait for confirmation
    console.log('Waiting for confirmation...');
    const result = await algosdk.waitForConfirmation(algodClient, txId, 20); 

    if (!result.assetIndex) {
      throw new Error('Asset creation failed - no asset ID returned');
    }

    // Save to database
    await NFT.create({
      assetId: result.assetIndex.toString(),
      name,
      url: assetURL,
      unitName,
      ownerAddress: creator,
      description: 'Algorand NFT',
      minting: 'Algorand Testnet',
      price,
      creator,
      transactionId: txId
    });

    res.json({
      success: true,
      assetId: result.assetIndex,
      transactionId: txId,
      explorerUrl: `https://lora.testnet.algokit.io/explorer/asset/${result.assetIndex}`,
    });
  } catch (error) {
    console.error('Error broadcasting NFT:', error);
    res.status(500).json({ error: 'Failed to broadcast NFT', details: error.message });
  }
});



router.get("/allnfts", async (req, res) => {
  try {
    const nfts = await NFT.find();
    res.json(nfts);
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Get NFT by ID
router.get("/:nftId", async (req, res) => {
  try {

    const nft = await NFT.findById(req.params.nftId);
    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }
    res.status(200).json(nft);
  } catch (error) {
    console.error("Error fetching NFT:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 4. Ask a Question
router.post("/ask", async (req, res) => {
  try {
    const { nftId, askerAddress, message } = req.body;

    if (!nftId || !askerAddress || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const nft = await NFT.findById(nftId);
    console.log("nftid:", nft);

    if (!nft) {
      return res.status(404).json({ error: "NFT not found" });
    }

    if (askerAddress === nft.ownerAddress) {
      return res.status(400).json({ error: "Owner cannot ask question" });
    }

    const qa = new QuestionAnswer({
      nftId,
      askerAddress,
      ownerAddress: nft.ownerAddress,
      message,
    });

    await qa.save();
    const io = req.io;
    io.to(nftId).emit("newMessage", qa); // for ask route



    // const hash = crypto.createHash("sha256").update(message).digest("hex");
    // const txId = await sendTransactionWithNote(hash);
    // qa.algorandTxId = txId;

    // await qa.save();

    res.status(201).json(qa);
  } catch (error) {
    console.error("Error asking question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 5. Reply to a Question
router.post("/reply", async (req, res) => {
  try {
    const { questionId, answer, ownerAddress } = req.body;

    const original = await QuestionAnswer.findById(questionId);
    if (!original) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (original.ownerAddress !== ownerAddress) {
      return res.status(403).json({ error: "Only the NFT owner can reply" });
    }

    const reply = new QuestionAnswer({
      nftId: original.nftId.toString(),
      askerAddress: original.askerAddress,
      ownerAddress: original.ownerAddress,
      message: answer,
      isSellerResponse: true,
    });

    await reply.save();


    const io = req.io;
    // io.to(original.nftId).emit("newMessage", reply); // for reply route
    console.log("Emitting reply to room:", original.nftId.toString(), reply);
    io.to(original.nftId.toString()).emit("newMessage", reply);



    res.json({ message: "Reply saved", data: reply });
  } catch (error) {
    console.error("Error replying:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//6. Get all chat messages (Q&A) for a specific NFT
router.get("/chat/:nftId", async (req, res) => {
  try {
    const { nftId } = req.params;

    if (!nftId) {
      return res.status(400).json({ error: "NFT ID is required" });
    }

    const messages = await QuestionAnswer.find({ nftId }).sort({ sentAt: 1 }); // oldest first
    console.log("messages", messages);


    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//7. Get all buyer list for specific NFT
router.get("/:nftId/buyers", async (req, res) => {
  try {
    const { nftId } = req.params;

    const buyers = await QuestionAnswer.aggregate([
      { $match: { nftId: new mongoose.Types.ObjectId(nftId) } },
      { $group: { _id: "$askerAddress" } }
    ]);

    res.json(buyers.map(b => b._id));
  } catch (err) {
    console.error("Failed to fetch buyers", err);
    res.status(500).json({ error: "Failed to fetch buyers" });
  }
});

module.exports = router;

