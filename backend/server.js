require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

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

// Root route
app.get("/", (req, res) => {
    res.json({ message: "ILFS backend running" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Backend Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});