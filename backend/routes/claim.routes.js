const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claim.controller");

// POST → submit a claim
router.post("/", claimController.createClaim);

// GET → admin fetch all claims
router.get("/", claimController.getClaims);

module.exports = router;
