const express = require("express");
const router = express.Router();

const { 
    getLostItems, 
    addLostItem,
    getLostItemById,
    getLostItemsByDate,
    getLostItemsByName,
    updateLostItem
} = require("../controllers/lost.controller");
const { validateLostInput } = require("../middleware/validation.middleware");

// Original routes
router.get("/", getLostItems);
router.post("/", validateLostInput, addLostItem);

// Your new routes
router.get("/search", getLostItemsByName);        // GET /api/lost/search?name=bag
router.get("/date/:date", getLostItemsByDate);    // GET /api/lost/date/2026-05-13
router.get("/:id", getLostItemById);              // GET /api/lost/3
router.put("/:id", updateLostItem);               // PUT /api/lost/3

module.exports = router;