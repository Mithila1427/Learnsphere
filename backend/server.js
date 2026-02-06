import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectMongo from "./db/mongo.js";
import authRoutes from "./routes/auth.routes.js";
import doubtRoutes from "./routes/doubt.routes.js";

dotenv.config();
connectMongo();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/doubt", doubtRoutes);

app.listen(5000, () => {
  console.log("✅ MongoDB connected");
  console.log("✅ Server running on port 5000");
});
