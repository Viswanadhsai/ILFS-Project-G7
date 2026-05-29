const express = require("express");
const router = express.Router();

const validate = require("../middleware/validation.middleware");
const { foundItemSchema } = require("../validation/found.validation");

const {
    getFoundItems,
    addFoundItem,
    updateFoundItem,
    deleteFoundItem,
    getFoundItemById
} = require("../controllers/found.controller");

const FoundItem = require("../models/found.model");

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

        const items = await FoundItem.find(filter);
        res.json(items);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ---------------- EXISTING ROUTES ----------------
router.get("/", getFoundItems);
router.get("/:id", getFoundItemById);

router.post("/", validate(foundItemSchema), addFoundItem);
router.put("/:id", validate(foundItemSchema), updateFoundItem);

router.delete("/:id", deleteFoundItem);

module.exports = router;
