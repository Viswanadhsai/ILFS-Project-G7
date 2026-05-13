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
    getFoundItemById,
    getFoundItemsByDate,
    getFoundItemsByName,
    updateFoundItem,
};
