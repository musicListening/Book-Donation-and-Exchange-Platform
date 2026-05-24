const express = require("express");
const cors = require("cors");
const app = express();

// Allow ANY website to talk to this server (Needed for Netlify + Render)
app.use(cors()); 
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Backend is running!" });
});

// Use the port provided by the environment (Render) or default to 5000 (Local)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🟢 Server running on port ${PORT}`));