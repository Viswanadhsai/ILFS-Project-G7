const fileSystem = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/found.json");

function readFoundItems() {
    if (!fileSystem.existsSync(filePath)) return [];
    return JSON.parse(fileSystem.readFileSync(filePath, "utf8"));
}

function writeFoundItems(items) {
    fileSystem.writeFileSync(filePath, JSON.stringify(items, null, 2));
}

module.exports = {
    readFoundItems,
    writeFoundItems
};
