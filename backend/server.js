require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/lost", require("./routes/lost.routes"));
app.use("/api/found", require("./routes/found.routes"));
app.use("/api/matching", require("./routes/matching.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/claims", require("./routes/claim.routes"));   // ⭐ CLAIM ROUTE ADDED
app.use("/api", require("./routes/rating.routes"));          // ⭐ RATING ROUTE

// Root route
app.get("/", (req, res) => {
    res.json({ message: "ILFS backend running" });
});

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
