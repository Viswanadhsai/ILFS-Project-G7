const mongoose = require("mongoose");

const FoundSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },   
    location: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "open" },
    image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("FoundItem", FoundSchema);
