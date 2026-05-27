const express = require("express");
const router = express.Router();

const { getAllItems } = require("../controllers/admin.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/items", protect, getAllItems);

module.exports = router;