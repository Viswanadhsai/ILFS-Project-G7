const { readLostItems } = require("../scripts/lost.script.js");
const { readFoundItems } = require("../scripts/found.script.js");

const getMatches = (req, res, next) => {
    try {
        const lostItems = readLostItems();
        const foundItems = readFoundItems();

        const matches = [];

        lostItems.forEach(lost => {
            foundItems.forEach(found => {
                if (
                    lost.name.toLowerCase() === found.name.toLowerCase() &&
                    lost.location.toLowerCase() === found.location.toLowerCase()
                ) {
                    matches.push({
                        lostId: lost.id,
                        foundId: found.id,
                        name: lost.name,
                        location: lost.location,
                        lostDate: lost.date,
                        foundDate: found.date
                    });
                }
            });
        });

        res.json(matches);
    } catch (err) {
        next(err);
    }
};

module.exports = { getMatches };
