const express = require("express");
const router = express.Router();

const { matchItems } = require("../controllers/matching.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, matchItems);

module.exports = router;