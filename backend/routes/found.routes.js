const express = require("express");
const router = express.Router();
const { 
    addFoundItem, 
    getFoundItems,
    getFoundItemById,
    getFoundItemsByDate,
    getFoundItemsByName,
    updateFoundItem
} = require("../controllers/found.controller");
const { validateFoundInput } = require("../middleware/validation.middleware");

// Original routes
router.get("/", getFoundItems);
router.post("/", validateFoundInput, addFoundItem);

// Your new routes
router.get("/search", getFoundItemsByName);       // GET /api/found/search?name=wallet
router.get("/date/:date", getFoundItemsByDate);   // GET /api/found/date/2026-05-13
router.get("/:id", getFoundItemById);             // GET /api/found/3
router.put("/:id", updateFoundItem);              // PUT /api/found/3

module.exports = router;