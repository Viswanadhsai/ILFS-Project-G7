const { readFoundItems, writeFoundItems } = require("../scripts/found.script");

const getFoundItems = (req, res) => {
    const items = readFoundItems();
    res.json(items);
};

const addFoundItem = (req, res) => {
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
};

module.exports = {
    getFoundItems,
    addFoundItem,
};
