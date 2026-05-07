const express = require("express");
const router = express.Router();
const { addFoundItem, getFoundItems } = require("../controllers/found.controller");
const { validateFoundInput } = require("../middleware/validation.middleware");

router.get("/", getFoundItems);
router.post("/", validateFoundInput, addFoundItem);

module.exports = router;
