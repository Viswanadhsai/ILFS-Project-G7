const express = require("express");
const router = express.Router();

const validate = require("../middleware/validation.middleware");
const { lostItemSchema } = require("../validation/lost.validation");

const {
    getLostItems,
    addLostItem,
    updateLostItem,
    deleteLostItem,
    getLostItemById
} = require("../controllers/lost.controller");

const LostItem = require("../models/lost.model");

// ---------------- FILTER ROUTE ----------------
router.get("/filter", async (req, res) => {
    try {
        const { location, date, category } = req.query;

        let filter = {};

        if (location) {
            filter.location = { $regex: new RegExp(location, "i") };
        }

        if (date) {
            filter.date = date;
        }

        if (category) {
            filter.category = { $regex: new RegExp(category, "i") };
        }

        const items = await LostItem.find(filter);
        res.json(items);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ---------------- EXISTING ROUTES ----------------
router.get("/", getLostItems);
router.get("/:id", getLostItemById);

router.post("/", validate(lostItemSchema), addLostItem);
router.put("/:id", validate(lostItemSchema), updateLostItem);

router.delete("/:id", deleteLostItem);

module.exports = router;
