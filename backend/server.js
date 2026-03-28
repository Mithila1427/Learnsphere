import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectMongo from "./db/mongo.js";
import authRoutes from "./routes/auth.routes.js";
import doubtRoutes from "./routes/doubt.routes.js";
import aiRoute from "./routes/ai.js";

dotenv.config();
connectMongo();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/doubt", doubtRoutes);
app.use("/api", aiRoute);

app.listen(5001, () => {
  console.log("✅ MongoDB connected");
  console.log("✅ Server running on port 5001");
});