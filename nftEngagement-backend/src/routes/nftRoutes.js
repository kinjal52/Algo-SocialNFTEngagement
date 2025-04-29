const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const { sendTransactionWithNote, getNFTOwner } = require("../services/algorandService");
const NFT = require("../models/nft");
const QuestionAnswer = require("../models/questionAnswer");
const upload = require("../config/multer");
const { log } = require("console");
const BASE_URL = 'http://localhost:3000';
// Health Check
router.get("/", (req, res) => {
  res.json({ message: "NFT Q&A Home" });
});

// 1. Create NFT (admin using Postman)
router.post("/create", upload.single('image'), async (req, res) => {
  try {
    const { name, description, ownerAddress, price } = req.body;

    console.log("Request body:", req.body);


    if (!name || !ownerAddress || !req.file || !price) {
      return res.status(400).json({ error: "Name, OwnerAddress,price and Image are required" });
    }

    // const imagePath = '/public/nft/' + req.file.filename;
    const imagePath = `${BASE_URL}/uploads/${req.file.filename}`; // Full URL
    console.log("imagePath:", imagePath);

    const newNFT = new NFT({
      name,
      description,
      ownerAddress,
      price,
      image: imagePath,
    });

    await newNFT.save();
    res.status(201).json(newNFT);
  } catch (error) {
    console.error("Error creating NFT:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.log("Question saved:", qa);

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
      nftId: original.nftId,
      askerAddress: original.askerAddress,
      ownerAddress: original.ownerAddress,
      message: answer,
      isSellerResponse: true,
    });

    await reply.save();
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
