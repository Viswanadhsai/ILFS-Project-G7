const FoundItem = require("../models/found.model");

// GET all found items
const getFoundItems = async (req, res, next) => {
    try {
        const items = await FoundItem.find();
        res.json(items);
    } catch (err) {
        next(err);
    }
};

// ADD found item
const addFoundItem = async (req, res, next) => {
    try {
        const item = req.body;

        if (!item.name || !item.location || !item.category || !item.date) {
            return res.status(400).json({
                message: "name, location, category and date required"
            });
        }

        const created = await FoundItem.create(item);
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

// UPDATE found item
const updateFoundItem = async (req, res, next) => {
    try {
        const updated = await FoundItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Found item not found" });
        }

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// DELETE found item
const deleteFoundItem = async (req, res, next) => {
    try {
        const deleted = await FoundItem.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Found item not found" });
        }

        res.json({ message: "Found item deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// GET found item by ID
const getFoundItemById = async (req, res, next) => {
    try {
        const item = await FoundItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json(item);
    } catch (err) {
        next(err);
    }
};

// GET found items by date
const getFoundItemsByDate = async (req, res, next) => {
    try {
        const items = await FoundItem.find({ date: req.params.date });

        if (items.length === 0) {
            return res.status(404).json({ message: "No items found for this date" });
        }

        res.json(items);
    } catch (err) {
        next(err);
    }
};

// GET found items by name
const getFoundItemsByName = async (req, res, next) => {
    try {
        const name = req.query.name?.toLowerCase();

        const items = await FoundItem.find({
            name: { $regex: name, $options: "i" }
        });

        if (items.length === 0) {
            return res.status(404).json({ message: "No items found with this name" });
        }

        res.json(items);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getFoundItems,
    addFoundItem,
    updateFoundItem,
    deleteFoundItem,
    getFoundItemById,
    getFoundItemsByDate,
    getFoundItemsByName
};
