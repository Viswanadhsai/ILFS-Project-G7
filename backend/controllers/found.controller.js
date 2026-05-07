const foundItems = require("../scripts/found.script");

const getAllFoundItems = (req, res) => {
    res.json(foundItems);
};

const createFoundItem = (req, res) => {
    console.log("POST /api/found", req.body);

    const item = req.body;

    if (!item.name || !item.location || !item.date) {
        return res.status(400).json({ message: "name, location and date required" });
    }

    item.id = foundItems.length + 1;
    foundItems.push(item);

    res.status(201).json(item);
};

module.exports = {
    getAllFoundItems,
    createFoundItem,
};
