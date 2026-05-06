const lostItems = require("../scripts/lost.script");
const foundItems = require("../scripts/found.script");

const getMatches = (req, res) => {
    const matches = [];

    lostItems.forEach(lost => {
        foundItems.forEach(found => {
            if (lost.name.toLowerCase() === found.name.toLowerCase()) {
                matches.push({ lost, found });
            }
        });
    });

    res.json(matches);
};

module.exports = {
    getMatches,
};
