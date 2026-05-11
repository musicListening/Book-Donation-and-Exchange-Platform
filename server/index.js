const express = require("express");
const cors = require("cors");
const app = express();

// Allow React to talk to this server
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Backend is running!" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🟢 Server running on http://localhost:${PORT}`));