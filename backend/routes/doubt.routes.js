import express from "express";
import { addToChroma, searchChroma } from "../db/chroma.db.js";

const router = express.Router();

/**
 * Add a doubt
 */
router.post("/add-doubt", async (req, res) => {
  const { doubt } = req.body;

  if (!doubt) {
    return res.status(400).json({ message: "Doubt is required" });
  }

  const id = Date.now().toString();

  await addToChroma(id, doubt, { type: "student_doubt" });

  res.json({ message: "Doubt added successfully" });
});

/**
 * Search doubts
 */
router.get("/search-doubt", async (req, res) => {
  const { q } = req.query;

  const result = await searchChroma(q);

  res.json(result);
});

export default router;
