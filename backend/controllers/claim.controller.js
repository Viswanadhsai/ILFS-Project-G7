const Claim = require("../models/claim.model");

// Create a new claim
exports.createClaim = async (req, res) => {
    console.log("📥 CLAIM RECEIVED:", req.body);

    try {
        const claim = new Claim(req.body);
        await claim.save();
        res.status(201).json({ message: "Claim submitted successfully", claim });
    } catch (error) {
        res.status(500).json({ message: "Error submitting claim", error });
    }
};

// Get all claims (admin)
exports.getClaims = async (req, res) => {
    try {
        const claims = await Claim.find().sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: "Error fetching claims", error });
    }
};
