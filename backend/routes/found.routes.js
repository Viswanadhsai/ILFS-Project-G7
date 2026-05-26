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

router.get("/", getFoundItems);
router.post("/", addFoundItem);
router.get("/search", getFoundItemsByName);
router.get("/date/:date", getFoundItemsByDate);
router.get("/:id", getFoundItemById);
router.put("/:id", updateFoundItem);
router.delete("/:id", deleteFoundItem);

module.exports = router;