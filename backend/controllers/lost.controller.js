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

module.exports = {
    getLostItems,
    addLostItem,
};
