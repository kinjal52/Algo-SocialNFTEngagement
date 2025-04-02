const express = require('express');
const router = express.Router(); // create a Router instance

// Add at least one route handler
router.get('/', (req, res) => {
  res.json({ message: "Q&A API Working!" });
});

module.exports = router; 