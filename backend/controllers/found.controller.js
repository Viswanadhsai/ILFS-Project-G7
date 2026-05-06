const foundItems = require("../scripts/found.script");

const getAllFoundItems = (req, res) => {
    res.json(foundItems);
};

const createFoundItem = (req, res) => {
    const item = req.body;

    if (!item.name || !item.location) {
        return res.status(400).json({ message: "name and location required" });
    }

    item.id = foundItems.length + 1;
    foundItems.push(item);

    res.status(201).json(item);
};

module.exports = {
    getAllFoundItems,
    createFoundItem,
};
