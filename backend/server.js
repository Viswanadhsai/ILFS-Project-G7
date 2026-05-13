const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Routes
app.use("/api/lost", require("./routes/lost.routes"));
app.use("/api/found", require("./routes/found.routes"));
app.use("/api/matching", require("./routes/matching.routes"));
app.use("/api/auth", require("./routes/auth.routes"));


// Root route
app.get("/", (req, res) => {
    res.json({ message: "ILFS backend running" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Backend Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});