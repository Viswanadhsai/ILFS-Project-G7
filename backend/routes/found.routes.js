const express = require("express");
const router = express.Router();

const {
    getFoundItems,
    addFoundItem,
    getFoundItemById,
    getFoundItemsByDate,
    getFoundItemsByName,
    updateFoundItem,
    deleteFoundItem
} = require("../controllers/found.controller");

const { validateFoundInput } = require("../middleware/validation.middleware");
const { protect } = require("../middleware/auth.middleware");

router.get("/", getFoundItems);
router.post("/", protect, addFoundItem);
router.get("/search", getFoundItemsByName);
router.get("/date/:date", getFoundItemsByDate);
router.get("/:id", getFoundItemById);
router.put("/:id", protect, updateFoundItem);
router.delete("/:id", protect, deleteFoundItem);

module.exports = router;