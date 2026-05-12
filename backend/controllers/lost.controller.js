const { readLostItems, writeLostItems } = require("../scripts/lost.script");

const getLostItems = (req, res, next) => {
    try {
        const items = readLostItems();
        res.json(items);
    } catch (err) {
        next(err);
    }
};

const addLostItem = (req, res, next) => {
    try {
        console.log("POST /api/lost", req.body);

        const item = req.body;

        if (!item.name || !item.location || !item.date) {
            return res.status(400).json({ message: "name, location and date required" });
        }

        const items = readLostItems();
        item.id = items.length + 1;

        items.push(item);
        writeLostItems(items);

        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
};

const updateLostItem = (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const items = readLostItems();

        const index = items.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ message: "Lost item not found" });
        }

        const updated = { ...items[index], ...req.body };
        items[index] = updated;

        writeLostItems(items);

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getLostItems,
    addLostItem,
    updateLostItem
};
