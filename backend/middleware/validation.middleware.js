// backend/middleware/validation.middleware.js

const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

const validateLostInput = (req, res, next) => {
    const { name, location, date, category } = req.body;

    if (
        !name || typeof name !== "string" ||
        !location || typeof location !== "string" ||
        !date || !isValidDate(date) ||
        !category || typeof category !== "string"
    ) {
        return res.status(400).json({ error: "Invalid lost item input. name, location, date and category are required" });
    }

    next();
};

const validateFoundInput = (req, res, next) => {
    const { name, location, date, category } = req.body;

    if (
        !name || typeof name !== "string" ||
        !location || typeof location !== "string" ||
        !date || !isValidDate(date) ||
        !category || typeof category !== "string"
    ) {
        return res.status(400).json({ error: "Invalid found item input. name, location, date and category are required" });
    }

    next();
};

module.exports = { validateLostInput, validateFoundInput };