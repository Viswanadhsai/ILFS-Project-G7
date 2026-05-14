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

//code to get lost items by id , date and item.
// Get lost item by ID
const getLostItemById = (req, res) => {
    const items = readLostItems();
    
    // req.params.id gets the :id from the URL
    const item = items.find(i => i.id === parseInt(req.params.id));
    
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }
    
    res.json(item);
};

// Get lost items by date
const getLostItemsByDate = (req, res) => {
    const items = readLostItems();
    
    // req.params.date gets the :date from the URL
    const filtered = items.filter(i => i.date === req.params.date);
    
    if (filtered.length === 0) {
        return res.status(404).json({ message: "No items found for this date" });
    }
    
    res.json(filtered);
};

// Get lost items by name
const getLostItemsByName = (req, res) => {
    const items = readLostItems();
    
    // req.query.name gets ?name=bag from the URL
    const name = req.query.name?.toLowerCase();
    
    const filtered = items.filter(i => 
        i.name?.toLowerCase().includes(name)
    );
    
    if (filtered.length === 0) {
        return res.status(404).json({ message: "No items found with this name" });
    }
    
    res.json(filtered);
};

// Update lost item by ID
const updateLostItem = (req, res) => {
    const items = readLostItems();
    
    // Find the index of the item we want to update
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ message: "Item not found" });
    }
    
    // Merge existing item with new data from req.body
    items[index] = { ...items[index], ...req.body };
    
    writeLostItems(items);
    res.json(items[index]);
};


module.exports = {
    getLostItems,
    addLostItem,
<<<<<<< HEAD
    updateLostItem,
    deleteLostItem
=======
    getLostItemById,
    getLostItemsByDate,
    getLostItemsByName,
    updateLostItem
>>>>>>> main
};

