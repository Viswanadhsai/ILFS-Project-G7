const FoundItem = require("../models/found.model");

const getFoundItems = async (req, res, next) => {
    try {
        const items = await FoundItem.find();
        res.json(items);
    } catch (err) {
        next(err);
    }
};

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

module.exports = {
    getFoundItems,
    addFoundItem,
    updateFoundItem,
    deleteFoundItem
};
