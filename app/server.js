const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5050;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Simple API endpoint
app.get("/api/students", (req, res) => {
  const students = [
    { id: 1, name: "Manan Bhimjiyani", grade: "A+" },
    { id: 2, name: "Het Patel", grade: "A" },
    { id: 3, name: "Devanshi Mehta", grade: "B+" }
  ];
  res.json(students);
});

// Default route (for frontend)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
