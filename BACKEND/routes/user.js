const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password from response
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update user
router.put("/update/:id", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, select: '-password' }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete user
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("📥 Signup request:", req.body);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user" // Default role
    });

    await newUser.save();
    console.log("✅ User created:", email);
    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    console.error("❌ Error during signup:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Login attempt:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
