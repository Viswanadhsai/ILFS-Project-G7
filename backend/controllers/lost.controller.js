const { readLostItems, writeLostItems } = require("../scripts/lost.script");

const getAllLostItems = (req, res) => {
    const items = readLostItems();
    res.json(items);
};

const createLostItem = (req, res) => {
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
};

module.exports = {
    getAllLostItems,
    createLostItem,
};
