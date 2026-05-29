const mongoose = require("mongoose");

const LostSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        location: { type: String, required: true },
        date: { type: String, required: true },
        description: { type: String },
        status: { type: String, default: "open" },
        image: { type: String },

        // NEW FIELDS
        foundDate: { type: String, default: null },   // when item was found
        isResolved: { type: Boolean, default: false } // mark item as resolved
    },
    { timestamps: true }
);

module.exports = mongoose.model("LostItem", LostSchema);
