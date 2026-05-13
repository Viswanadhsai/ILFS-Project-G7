const express = require("express");
const router = express.Router();
const { getMatches } = require("../controllers/matching.controller");

router.get("/", getMatches);

module.exports = router;
