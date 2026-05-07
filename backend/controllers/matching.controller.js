const lostItems = require("../scripts/lost.script");
const foundItems = require("../scripts/found.script");

const getMatches = (req, res) => {
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
};

module.exports = { getMatches };
