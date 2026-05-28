const express = require("express");
const router = express.Router();

const { matchItems } = require("../controllers/matching.controller");

router.get("/", matchItems);

module.exports = router;
