const express = require("express");
const router = express.Router();
<<<<<<< HEAD

const {
    getFoundItems,
    addFoundItem,
    updateFoundItem,
    deleteFoundItem
} = require("../controllers/found.controller");
=======
const { 
    addFoundItem, 
    getFoundItems,
    getFoundItemById,
    getFoundItemsByDate,
    getFoundItemsByName,
    updateFoundItem
} = require("../controllers/found.controller");
const { validateFoundInput } = require("../middleware/validation.middleware");
>>>>>>> main

// Original routes
router.get("/", getFoundItems);
router.post("/", addFoundItem);
router.put("/:id", updateFoundItem);
router.delete("/:id", deleteFoundItem);

// Your new routes
router.get("/search", getFoundItemsByName);       // GET /api/found/search?name=wallet
router.get("/date/:date", getFoundItemsByDate);   // GET /api/found/date/2026-05-13
router.get("/:id", getFoundItemById);             // GET /api/found/3
router.put("/:id", updateFoundItem);              // PUT /api/found/3

module.exports = router;