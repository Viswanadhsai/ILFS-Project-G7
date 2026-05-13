const { readLostItems, writeLostItems } = require("../scripts/lost.script");

const getLostItems = (req, res) => {
    let items = readLostItems();

    const { location, name, date, category,sort} = req.query;
//filtering lost items based on query parameters
    if (location) {
        items = items.filter(i => 
            i.location?.toLowerCase().includes(location.toLowerCase())
        );
    }

    if (name) {
        items = items.filter(i => 
            i.name?.toLowerCase().includes(name.toLowerCase())
        );
    }

    if (date) {
        items = items.filter(i => i.date === date);
    }

    if (category) {
        items = items.filter(i => 
            i.category?.toLowerCase().includes(category.toLowerCase())
        );
    }
//sorting lost items by date,name,category and location (ascending order)
if (sort === "date") {
        items = items.sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
    }

    if (sort === "name") {
        items = items.sort((a, b) => 
            a.name?.localeCompare(b.name)
        );
    }

    if (sort === "category") {
        items = items.sort((a, b) => 
            a.category?.localeCompare(b.category)
        );
    }

    if (sort === "location") {
        items = items.sort((a, b) => 
            a.location?.localeCompare(b.location)
        );
    }

    res.json(items);
};

const addLostItem = (req, res) => {
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
    getLostItemById,
    getLostItemsByDate,
    getLostItemsByName,
    updateLostItem
};

