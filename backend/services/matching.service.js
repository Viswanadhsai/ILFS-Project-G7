// Helper to count matching words between two strings
const similarityScore = (str1 = "", str2 = "") => {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    const overlap = words1.filter(w => words2.includes(w));
    return overlap.length;
};

// Compute match score between a lost and found item
const computeMatchScore = (lost, found) => {
    let score = 0;

    // Category match (high weight)
    if (lost.category && found.category &&
        lost.category.toLowerCase() === found.category.toLowerCase()) {
        score += 3;
    }

    // Name match (high weight)
    if (lost.name && found.name &&
        lost.name.toLowerCase() === found.name.toLowerCase()) {
        score += 3;
    }

    // Location match (medium weight)
    if (lost.location && found.location &&
        lost.location.toLowerCase() === found.location.toLowerCase()) {
        score += 2;
    }

    // Description similarity (low weight)
    if (lost.description && found.description) {
        score += similarityScore(lost.description, found.description);
    }

    return score;
};

module.exports = { computeMatchScore, similarityScore };