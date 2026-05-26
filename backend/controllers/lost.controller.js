const LostItem = require("../models/lost.model");

const getLostItems = async (req, res, next) => {
    try {
        const items = await LostItem.find();
        res.json(items);
    } catch (err) { next(err); }
};

const addLostItem = async (req, res, next) => {
    try {
        const item = req.body;
        if (!item.name || !item.location || !item.category || !item.date) {
            return res.status(400).json({ message: "name, location, category and date required" });
        }
        const created = await LostItem.create(item);
        res.status(201).json(created);
    } catch (err) { next(err); }
};

const getLostItemById = async (req, res, next) => {
    try {
        const item = await LostItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json(item);
    } catch (err) { next(err); }
};

const getLostItemsByDate = async (req, res, next) => {
    try {
        const items = await LostItem.find({ date: req.params.date });
        if (items.length === 0)
            return res.status(404).json({ message: "No items found for this date" });
        res.json(items);
    } catch (err) { next(err); }
};

const getLostItemsByName = async (req, res, next) => {
    try {
        const name = req.query.name;
        const items = await LostItem.find({ name: { $regex: name, $options: "i" } });
        if (items.length === 0)
            return res.status(404).json({ message: "No items found with this name" });
        res.json(items);
    } catch (err) { next(err); }
};

const updateLostItem = async (req, res, next) => {
    try {
        const updated = await LostItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Lost item not found" });
        res.json(updated);
    } catch (err) { next(err); }
};

const deleteLostItem = async (req, res, next) => {
    try {
        const deleted = await LostItem.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Lost item not found" });
        res.json({ message: "Lost item deleted successfully" });
    } catch (err) { next(err); }
};

module.exports = {
    getLostItems, addLostItem,
    getLostItemById, getLostItemsByDate, getLostItemsByName,
    updateLostItem, deleteLostItem
};