const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
    itemTitle: { type: String, required: true },
    category: { type: String },
    location: { type: String },
    matchTitle: { type: String },
    claimantName: { type: String, required: true },
    claimantEmail: { type: String, required: true },
    proof: { type: String, required: true },
    status: { type: String, default: "Pending" }, // Pending, Approved, Rejected
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Claim", claimSchema);
