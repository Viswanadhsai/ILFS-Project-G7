const express = require("express");
const router = express.Router();

const {
    getLostItems,
    addLostItem,
    updateLostItem,
    deleteLostItem,
    getLostItemsByName,
    getLostItemsByDate,
    getLostItemById
} = require("../controllers/lost.controller");

// Original routes
router.get("/", getLostItems);
router.post("/", addLostItem);
router.put("/:id", updateLostItem);
router.delete("/:id", deleteLostItem);

// Additional routes
router.get("/search", getLostItemsByName);        // GET /api/lost/search?name=bag
router.get("/date/:date", getLostItemsByDate);    // GET /api/lost/date/2026-05-13
router.get("/:id", getLostItemById);              // GET /api/lost/3

module.exports = router;
