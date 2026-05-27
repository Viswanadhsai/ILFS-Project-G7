const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema({
    lostItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LostItem",
        required: true
    },
    foundItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoundItem",
        required: true
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Claim", ClaimSchema);