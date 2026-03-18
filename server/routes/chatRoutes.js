const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatController");
const authMiddleware = require("../middleware/auth");

// Chat endpoint - requires authentication
router.post("/", authMiddleware, chat);

module.exports = router;