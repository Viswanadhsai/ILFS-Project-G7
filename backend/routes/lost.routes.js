const express = require("express");
const router = express.Router();
const { addLostItem, getLostItems } = require("../controllers/lost.controller");
const { validateLostInput } = require("../middleware/validation.middleware");

router.get("/", getLostItems);
router.post("/", validateLostInput, addLostItem);

module.exports = router;
