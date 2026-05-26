const express = require("express");
const router = express.Router();

const {
    getLostItems,
    addLostItem,
    getLostItemById,
    getLostItemsByDate,
    getLostItemsByName,
    updateLostItem,
    deleteLostItem
} = require("../controllers/lost.controller");

const { validateLostInput } = require("../middleware/validation.middleware");
const { protect } = require("../middleware/auth.middleware");

router.get("/", getLostItems);
router.post("/", protect, addLostItem);
router.get("/search", getLostItemsByName);
router.get("/date/:date", getLostItemsByDate);
router.get("/:id", getLostItemById);
router.put("/:id", protect, updateLostItem);
router.delete("/:id", protect, deleteLostItem);

module.exports = router;