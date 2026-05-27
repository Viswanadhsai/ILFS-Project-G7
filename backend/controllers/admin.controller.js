const LostItem = require("../models/lost.model");
const FoundItem = require("../models/found.model");

// GET all items (lost + found) with pagination and sorting
const getAllItems = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || "createdAt";
        const order = req.query.order === "asc" ? 1 : -1;
        const skip = (page - 1) * limit;

        const lostItems = await LostItem.find()
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit);

        const foundItems = await FoundItem.find()
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit);

        const totalLost = await LostItem.countDocuments();
        const totalFound = await FoundItem.countDocuments();

        res.json({
            success: true,
            pagination: {
                page,
                limit,
                totalLost,
                totalFound
            },
            data: {
                lostItems,
                foundItems
            }
        });
    } catch (err) {
        next(err);
    }
};

// GET all matched items
const getAllMatches = async (req, res, next) => {
    try {
        const lostItems = await LostItem.find();
        const foundItems = await FoundItem.find();

        const matches = [];

        lostItems.forEach(lost => {
            foundItems.forEach(found => {
                let score = 0;

                if (lost.category && found.category &&
                    lost.category.toLowerCase() === found.category.toLowerCase()) {
                    score += 3;
                }

                if (lost.name && found.name &&
                    lost.name.toLowerCase() === found.name.toLowerCase()) {
                    score += 3;
                }

                if (lost.location && found.location &&
                    lost.location.toLowerCase() === found.location.toLowerCase()) {
                    score += 2;
                }

                if (score >= 3) {
                    matches.push({
                        lostItem: lost,
                        foundItem: found,
                        score
                    });
                }
            });
        });

        matches.sort((a, b) => b.score - a.score);

        res.json({
            success: true,
            totalMatches: matches.length,
            matches
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { getAllItems, getAllMatches };