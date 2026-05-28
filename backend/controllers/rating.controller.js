const Rating = require('../models/rating.model');

// Submit rating
exports.submitRating = async (req, res) => {
    console.log("⭐ RATING RECEIVED:", req.body);

    try {
        const { value } = req.body;

        if (!value || value < 1 || value > 5) {
            return res.status(400).json({ message: "Invalid rating value" });
        }

        await Rating.create({ value });

        const stats = await Rating.aggregate([
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$value" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        const average = stats[0]?.averageRating || 0;
        const total = stats[0]?.totalRatings || 0;

        res.json({
            message: "Rating submitted successfully",
            averageRating: average.toFixed(2),
            totalRatings: total
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
