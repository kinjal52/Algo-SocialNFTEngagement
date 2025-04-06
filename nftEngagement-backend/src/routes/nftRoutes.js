const express = require("express");
const router = express.Router();
const { getNFTOwner } = require("../services/algorandService");
const nft = require("../models/nft");
const questionAnswer = require("../models/questionAnswer");

router.get("/", (req, res) => {
  res.json({ message: "NFT Q&A Home" });
});

router.get('/Allnfts', async (req, res) => {
  const nfts = await nft.find();
  res.json(nfts);
});

// Get all Q&A for an NFT
router.get("/:assetId", async (req, res) => {
  const questions = await questionAnswer.find({ assetId: req.params.assetId });
  res.json(questions);
});

//ask a question
router.post('/ask', async (req, res) => {
  const { assetId, askerAddress, question } = req.body;

  try {
    // Find the NFT by its _id (ObjectId)
    const nftdata = await nft.findById(assetId);
    if (!nftdata) return res.status(404).json({ error: 'NFT not found' });

    console.log("nftdata", nftdata, nftdata.ownerAddress);

    // Create a new QuestionAnswer document
    const qa = new questionAnswer({
      assetId, // Store assetId as a string
      askerAddress,
      question,
      ownerAddress: nftdata.ownerAddress
    });
    console.log("qa", qa);

    await qa.save();
    res.status(201).json(qa);
  } catch (error) {
    console.error("Error creating QA:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Post an answer (from NFT owner)
// router.post("/answer/:questionId", async (req, res) => {
//   const { answer, responderAddress } = req.body;
//   const question = await Question.findById(req.params.questionId);


//   // Verify responder owns the NFT
//   const isOwner = await verifyNFTOwner(question.assetId, responderAddress,questionId);
//   if (!isOwner) return res.status(403).json({ error: "Only NFT owner can answer!" });

//   question.answer = answer;
//   question.isAnswered = true;
//   await question.save();
//   res.json(question);
// });

//reply to a question (from NFT owner)
router.post('/reply', async (req, res) => {
  const { assetId, answer, ownerAddress } = req.body;
  const assetdata = await questionAnswer.findOne({ assetId });
  console.log("assetid", assetdata);
  if (!assetdata) return res.status(404).json({ error: 'Assetid not found' });

  if (assetdata.ownerAddress !== ownerAddress) {
    return res.status(403).json({ error: 'Unauthorized or QA not found' });
  }
  // Verify responder owns the NFT
  const isOwner = await getNFTOwner(nft.assetId, ownerAddress);
  if (!isOwner) return res.status(403).json({ error: 'You are not the owner of this NFT' });

  const qa = new questionAnswer({
    assetId,
    askerAddress: assetdata.askerAddress,
    // question,
    answer,
    ownerAddress: assetdata.ownerAddress
  });
  console.log("qa", qa);
  await qa.save();
  res.status(201).json(qa);
});

module.exports = router;