const lostItems = require("../scripts/lost.script");

const getAllLostItems = (req, res) => {
    res.json(lostItems);
};

const createLostItem = (req, res) => {
    const item = req.body;

    // Input validation
    if (!item.name || !item.location || !item.date) {
        return res.status(400).json({ message: "name, location and date required" });
    }

    item.id = lostItems.length + 1;
    lostItems.push(item);

    res.status(201).json(item);
};

module.exports = {
    getAllLostItems,
    createLostItem,
};
