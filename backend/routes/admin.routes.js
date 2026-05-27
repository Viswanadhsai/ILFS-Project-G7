const express = require("express");
const router = express.Router();

const { getAllItems, getAllMatches, getAllClaims } = require("../controllers/admin.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/items", protect, getAllItems);
router.get("/matches", protect, getAllMatches);
router.get("/claims", protect, getAllClaims);

module.exports = router;