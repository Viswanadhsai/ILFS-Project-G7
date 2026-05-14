const express = require("express");
const router = express.Router();

const {
    getFoundItems,
    addFoundItem,
    updateFoundItem,
    deleteFoundItem,
    getFoundItemsByName,
    getFoundItemsByDate,
    getFoundItemById
} = require("../controllers/found.controller");

// Original routes
router.get("/", getFoundItems);
router.post("/", addFoundItem);
router.put("/:id", updateFoundItem);
router.delete("/:id", deleteFoundItem);

// Additional routes
router.get("/search", getFoundItemsByName);
router.get("/date/:date", getFoundItemsByDate);
router.get("/:id", getFoundItemById);

module.exports = router;
