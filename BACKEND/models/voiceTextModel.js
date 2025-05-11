const mongoose = require("mongoose");

const VoiceTextSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

module.exports = mongoose.model("VoiceText", VoiceTextSchema);
