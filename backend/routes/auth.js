import express from 'express';
import User from '../models/User.js'; // Import your Sequelize model
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Renamed to 'router' for clarity
const router = express.Router();

// Health check route (optional)
router.get("/health", (req, res) => {
  res.json({ ok: true, message: "Auth API is working" });
});

// --- REGISTRATION ROUTE ---
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "Please provide all fields: username, email, password, and role." });
    }

    // --- === ERROR FIX START === ---
    // The [Op.or] syntax was causing the crash.
    // This is a simpler, more reliable way to check.

    // 2. Check if email already exists
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // 3. Check if username already exists
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already exists." });
    }
    // --- === ERROR FIX END === ---

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Create the new user
    const newUser = await User.create({
      username,
      email,
      passwordHash, // Make sure your model's field is named 'passwordHash'
      role
    });

    // 6. Send success response
    res.status(201).json({ message: "User registered successfully!" });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});


// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Please provide username, password, and role" });
    }

    // Find by 'username' and 'role'
    const user = await User.findOne({ 
      where: { username, role } 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or role" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create token
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send back token and user info
    res.json({ 
      message: "Login successful", 
      token, 
      user: { 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Use 'router' as the export
export default router;

