const LostItem = require("../models/lost.model");

// GET all lost items
exports.getLostItems = async (req, res) => {
    try {
        const items = await LostItem.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADD lost item
exports.addLostItem = async (req, res) => {
    try {
        const item = await LostItem.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// UPDATE lost item
exports.updateLostItem = async (req, res) => {
    try {
        const updated = await LostItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE lost item
exports.deleteLostItem = async (req, res) => {
    try {
        await LostItem.findByIdAndDelete(req.params.id);
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// SEARCH by name
exports.getLostItemsByName = async (req, res) => {
    try {
        const { name } = req.query;
        const items = await LostItem.find({
            name: { $regex: name, $options: "i" }
        });
        res.json(items);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// FILTER by date
exports.getLostItemsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const items = await LostItem.find({ date });
        res.json(items);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET by ID
exports.getLostItemById = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);
        res.json(item);
    } catch (err) {
        res.status(404).json({ error: "Item not found" });
    }
};
