import express from "express";
import multer from "multer";
import { spawn } from "child_process";

const router = express.Router();

// store uploaded files
const upload = multer({ dest: "uploads/" });

router.post("/ask", upload.single("file"), (req, res) => {
  const question = req.body.question;
  const pdfPath = req.file?.path;

  const python = spawn("python", [
    "ai_services/run_ai.py",
    pdfPath || "",
    question || ""
  ]);

  let result = "";

  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });

  python.on("close", () => {
    res.json({ answer: result });
  });
});

export default router;