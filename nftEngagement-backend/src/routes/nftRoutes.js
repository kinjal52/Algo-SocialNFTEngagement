
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



// Handle BigInt serialization
BigInt.prototype.toJSON = function () { return this.toString() };

function getAlgodClient(network = 'testnet') {
  const servers = {
    testnet: 'https://testnet-api.algonode.cloud',
    mainnet: 'https://mainnet-api.algonode.cloud'
  };
  return new algosdk.Algodv2('', servers[network], 443);
}

router.post('/create-nft', upload.single('image'), async (req, res) => {
  let txId;
  try {
    const {
      name,
      unitName,
      note = "Algorand NFT",
      network = "testnet",
      price,
    } = req.body;

    // Validate fields
    if (!name || !unitName || !req.file) {
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

    const account = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);
    console.log("account", account.addr);

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
      defaultFrozen: false
    });

    const signedTxn = txn.signTxn(account.sk);
    txId = txn.txID().toString();
    await algodClient.sendRawTransaction(signedTxn).do();
    const result = await algosdk.waitForConfirmation(algodClient, txId, 10);

    if (!result.assetIndex) {
      throw new Error("Asset creation failed - no asset ID returned");
    }

    // ✅ Save to DB
    await NFT.create({
      assetId: result.assetIndex.toString(),
      name,
      url: assetURL,
      ownerAddress: account.addr.toString(),
      description: note,
      minting: 'Algorand Testnet',
      price: price,
      creator: account.addr.toString()
    });

    res.json({
      success: true,
      assetId: result.assetIndex,
      transactionId: txId,
      explorerUrl: `https://lora.algokit.io/testnet/asset/${result.assetIndex}`
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


// 2. List all NFTs
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

module.exports = router;

