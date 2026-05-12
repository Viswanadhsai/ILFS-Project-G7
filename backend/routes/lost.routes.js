const express = require("express");
const router = express.Router();

const {
    getLostItems,
    addLostItem,
    updateLostItem,
    deleteLostItem
} = require("../controllers/lost.controller");

router.get("/", getLostItems);
router.post("/", addLostItem);
router.put("/:id", updateLostItem);
router.delete("/:id", deleteLostItem);

module.exports = router;
