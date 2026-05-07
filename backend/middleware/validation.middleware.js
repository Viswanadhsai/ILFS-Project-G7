// backend/middleware/validation.middleware.js

const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

const validateLostInput = (req, res, next) => {
    const { name, location, date } = req.body;

    if (
        !name || typeof name !== "string" ||
        !location || typeof location !== "string" ||
        !date || !isValidDate(date)
    ) {
        return res.status(400).json({ error: "Invalid lost item input" });
    }

    next();
};

const validateFoundInput = (req, res, next) => {
    const { name, location, date } = req.body;

    if (
        !name || typeof name !== "string" ||
        !location || typeof location !== "string" ||
        !date || !isValidDate(date)
    ) {
        return res.status(400).json({ error: "Invalid found item input" });
    }

    next();
};

module.exports = { validateLostInput, validateFoundInput };
