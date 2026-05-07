const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/lost", require("./routes/lost.routes"));
app.use("/api/found", require("./routes/found.routes"));
app.use("/api/matching", require("./routes/matching.routes"));

app.get("/", (req, res) => {
    res.json({ message: "ILFS backend running" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Backend Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
