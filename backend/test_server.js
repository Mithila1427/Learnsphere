import express from "express";
const app = express();
app.get("/health", (req, res) => res.json({ ok: true }));
const PORT = 5000;
app.listen(PORT, () => console.log("Test server running on port", PORT));
