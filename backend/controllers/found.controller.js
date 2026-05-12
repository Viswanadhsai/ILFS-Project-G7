const { readFoundItems, writeFoundItems } = require("../scripts/found.script");

const getFoundItems = (req, res, next) => {
    try {
        const items = readFoundItems();
        res.json(items);
    } catch (err) {
        next(err);
    }
};

const addFoundItem = (req, res, next) => {
    try {
        console.log("POST /api/found", req.body);

        const item = req.body;

        if (!item.name || !item.location || !item.date) {
            return res.status(400).json({ message: "name, location and date required" });
        }

        const items = readFoundItems();
        item.id = items.length + 1;

        items.push(item);
        writeFoundItems(items);

        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
};

const updateFoundItem = (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const items = readFoundItems();

        const index = items.findIndex(item => item.id === id);
        if (index === -1) {
            return res.status(404).json({ message: "Found item not found" });
        }

        const updated = { ...items[index], ...req.body };
        items[index] = updated;

        writeFoundItems(items);

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getFoundItems,
    addFoundItem,
    updateFoundItem
};
