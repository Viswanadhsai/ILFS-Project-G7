const express = require("express");
const router = express.Router();

<<<<<<< HEAD
const {
    getLostItems,
    addLostItem,
    updateLostItem,
    deleteLostItem
} = require("../controllers/lost.controller");
=======
const { 
    getLostItems, 
    addLostItem,
    getLostItemById,
    getLostItemsByDate,
    getLostItemsByName,
    updateLostItem
} = require("../controllers/lost.controller");
const { validateLostInput } = require("../middleware/validation.middleware");
>>>>>>> main

// Original routes
router.get("/", getLostItems);
router.post("/", addLostItem);
router.put("/:id", updateLostItem);
router.delete("/:id", deleteLostItem);

// Your new routes
router.get("/search", getLostItemsByName);        // GET /api/lost/search?name=bag
router.get("/date/:date", getLostItemsByDate);    // GET /api/lost/date/2026-05-13
router.get("/:id", getLostItemById);              // GET /api/lost/3
router.put("/:id", updateLostItem);               // PUT /api/lost/3

module.exports = router;