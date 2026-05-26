const LostItem = require("../models/lost.model");
const FoundItem = require("../models/found.model");
const { computeMatchScore } = require("../services/matching.service");

const matchItems = async (req, res, next) => {
    try {
        const lostItems = await LostItem.find();
        const foundItems = await FoundItem.find();

        const matches = [];

        lostItems.forEach(lost => {
            foundItems.forEach(found => {
                const score = computeMatchScore(lost, found);

                // Only include if score is meaningful
                if (score >= 3) {
                    matches.push({
                        lostItem: lost,
                        foundItem: found,
                        score
                    });
                }
            });
        });

        // Sort by score descending (best matches first)
        matches.sort((a, b) => b.score - a.score);

        res.json({
            totalMatches: matches.length,
            matches
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { matchItems };