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

//code to get found items by id , date and item.
// Get found item by ID
const getFoundItemById = (req, res) => {
    const items = readFoundItems();
    
    const item = items.find(i => i.id === parseInt(req.params.id));
    
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }
    
    res.json(item);
};

// Get found items by date
const getFoundItemsByDate = (req, res) => {
    const items = readFoundItems();
    
    const filtered = items.filter(i => i.date === req.params.date);
    
    if (filtered.length === 0) {
        return res.status(404).json({ message: "No items found for this date" });
    }
    
    res.json(filtered);
};

// Get found items by name
const getFoundItemsByName = (req, res) => {
    const items = readFoundItems();
    
    const name = req.query.name?.toLowerCase();
    
    const filtered = items.filter(i => 
        i.name?.toLowerCase().includes(name)
    );
    
    if (filtered.length === 0) {
        return res.status(404).json({ message: "No items found with this name" });
    }
    
    res.json(filtered);
};

// Update found item by ID
const updateFoundItem = (req, res) => {
    const items = readFoundItems();
    
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ message: "Item not found" });
    }
    
    items[index] = { ...items[index], ...req.body };
    
    writeFoundItems(items);
    res.json(items[index]);
};

module.exports = {
    getFoundItems,
    addFoundItem,
<<<<<<< HEAD
    updateFoundItem,
    deleteFoundItem
=======
    getFoundItemById,
    getFoundItemsByDate,
    getFoundItemsByName,
    updateFoundItem,
>>>>>>> main
};
