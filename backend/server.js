import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // Import the 'path' module
import { fileURLToPath } from "url"; // Import for ES modules
import jwt from 'jsonwebtoken'; // <<< --- ADDED: Needed to verify tokens

import authRoutes from "./routes/auth.js";
import sequelize from "./db/connection.js"; 

dotenv.config();
const PORT = process.env.PORT || 5000;

// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// This sets up CORS 
app.use(cors()); // Using "*" to allow file:// origin during dev
app.use(express.json());

// *** THIS IS THE UPDATED PART TO CONNECT YOUR PAGES ***
// This line tells Express to serve your HTML, CSS, and JS files
// from the 'public' folder. 
// This path assumes your 'public' folder is *next to* your 'backend' folder.
const publicPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(publicPath));

// Your API routes
app.use("/api/auth", authRoutes);

app.get("/api/auth/health", (req, res) => {
  res.json({ ok: true, message: "API up" });
});

// --- vvv NEW CHANGES START HERE vvv ---

// --- Simple Token Auth Middleware ---
const checkAuth = (req, res, next) => {
  try {
    // Get token from the "Authorization" header (e.g., "Bearer TOKEN_STRING")
    const token = req.headers.authorization.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Auth failed! No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info (like id, role) from the token to the request object
    req.user = decoded; 
    
    // Continue to the next (protected) route
    next(); 
  } catch (error) {
    // This catches invalid tokens, expired tokens, etc.
    res.status(401).json({ message: "Auth failed! Token is invalid." });
  }
};

// --- Dashboard API Routes (Placeholders) ---
// These routes are protected by the 'checkAuth' middleware

// -- Student Routes --
app.get("/api/student/library", checkAuth, (req, res) => {
  // TODO: Add logic to fetch library items for the logged-in student (req.user.id)
  console.log(`Fetching library for user: ${req.user.id}`);
  res.json([]); // Send back empty array
});

app.get("/api/student/chats", checkAuth, (req, res) => {
  // TODO: Add logic to fetch chats for the logged-in student (req.user.id)
  console.log(`Fetching chats for user: ${req.user.id}`);
  // Send back empty array instead of dummy data
  res.json([]);
});

// -- Teacher Routes --
app.get("/api/teacher/reviews/pending", checkAuth, (req, res) => {
  // TODO: Add logic to fetch pending reviews for this teacher (req.user.id)
  console.log(`Fetching pending reviews for teacher: ${req.user.id}`);
  // Send back empty array instead of dummy data
  res.json([]);
});

app.get("/api/teacher/analytics/progress", checkAuth, (req, res) => {
  // TODO: Add logic to fetch progress data for this teacher's students
  console.log(`Fetching analytics for teacher: ${req.user.id}`);
  // Send back empty object instead of dummy data
  res.json({});
});

// --- ^^^ NEW CHANGES END HERE ^^^ ---


// A simple route to serve the login page by default
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, 'login.html'));
});


// Start the server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MSSQL Database connected");

    // Using force: true to drop and recreate tables for development
    await sequelize.sync({ force: true }); 
    console.log("✅ Models synced with database");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); 
  }
};

startServer();

