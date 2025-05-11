const express = require("express");
const router = express.Router();
const VoiceText = require("../models/voiceTextModel");

// Save transcribed text
router.post("/save", async (req, res) => {
  try {
    const newText = new VoiceText({ text: req.body.text });
    await newText.save();
    res.status(201).json({ message: "Text saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save text" });
  }
});

// Get all saved texts
router.get("/texts", async (req, res) => {
  try {
    const texts = await VoiceText.find();
    res.json(texts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch texts" });
  }
});

module.exports = router;
//k