const LostItem = require("../models/lost.model");
const FoundItem = require("../models/found.model");

const matchItems = async (req, res, next) => {
    try {
        // Fetch all lost + found items
        const lostItems = await LostItem.find();
        const foundItems = await FoundItem.find();

        const matches = [];

        // Simple matching logic: name + category
        lostItems.forEach(lost => {
            foundItems.forEach(found => {
                if (
                    lost.name.toLowerCase() === found.name.toLowerCase() &&
                    lost.category.toLowerCase() === found.category.toLowerCase()
                ) {
                    matches.push({
                        lostItem: lost,
                        foundItem: found,
                        score: 2 // simple scoring system
                    });
                }
            });
        });

        res.json({
            totalMatches: matches.length,
            matches
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { matchItems };
