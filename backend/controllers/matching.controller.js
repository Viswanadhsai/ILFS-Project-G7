const LostItem = require("../models/lost.model");
const FoundItem = require("../models/found.model");

const matchItems = async (req, res, next) => {
    console.log("🔍 MATCHING REQUEST RECEIVED");

    try {
        const lostItems = await LostItem.find();
        const foundItems = await FoundItem.find();

        console.log(`📦 Lost Items: ${lostItems.length}, Found Items: ${foundItems.length}`);

        const matches = [];

        lostItems.forEach(lost => {
            foundItems.forEach(found => {
                if (
                    lost.name.toLowerCase() === found.name.toLowerCase() &&
                    lost.category.toLowerCase() === found.category.toLowerCase()
                ) {
                    matches.push({
                        lostItem: lost,
                        foundItem: found,
                        score: 2
                    });
                }
            });
        });

        console.log("🎯 MATCHES FOUND:", matches.length);

        res.json({
            totalMatches: matches.length,
            matches
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { matchItems };
