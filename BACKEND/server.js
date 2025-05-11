const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 8070;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json()); // Body parser
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files

// ===== DATABASE CONNECTION =====
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};
connectDB();

// ===== ROUTES =====
const announceRouter = require("./routes/announcements");
const feedbackRouter = require("./routes/feedbacks");
const buildingRouter = require("./routes/buildingRoutes");
const hallRouter = require("./routes/hallRoutes");
const voiceRouter = require("./routes/voiceRoutes");
const userRouter = require("./routes/user"); // User auth routes

// Mount routes
app.use("/announce", announceRouter);
app.use("/feedback", feedbackRouter);
app.use("/building", buildingRouter);
app.use("/hall", hallRouter);
app.use("/voice", voiceRouter);
app.use("/api/users", userRouter);

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ msg: "Internal server error" });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
