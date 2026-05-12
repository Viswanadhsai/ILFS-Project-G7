const LostItem = require("../models/lost.model");

const getLostItems = async (req, res, next) => {
    try {
        const items = await LostItem.find();
        res.json(items);
    } catch (err) {
        next(err);
    }
};

const addLostItem = async (req, res, next) => {
    try {
        const item = req.body;

        if (!item.name || !item.location || !item.category || !item.date) {
            return res.status(400).json({
                message: "name, location, category and date required"
            });
        }

        const created = await LostItem.create(item);
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

const updateLostItem = async (req, res, next) => {
    try {
        const updated = await LostItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Lost item not found" });
        }

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

const deleteLostItem = async (req, res, next) => {
    try {
        const deleted = await LostItem.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Lost item not found" });
        }

        res.json({ message: "Lost item deleted successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getLostItems,
    addLostItem,
    updateLostItem,
    deleteLostItem
};
