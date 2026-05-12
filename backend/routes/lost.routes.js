const express = require("express");
const router = express.Router();

const {
    getLostItems,
    addLostItem,
    updateLostItem
} = require("../controllers/lost.controller");

router.get("/", getLostItems);
router.post("/", addLostItem);
router.put("/:id", updateLostItem);

module.exports = router;
