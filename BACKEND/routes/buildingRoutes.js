const express = require("express");
const router = express.Router();
const Building = require("../models/building");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const { jsPDF } = require("jspdf");
const fs = require("fs");

// Multer storage configuration for image uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Serve the static uploads directory
router.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ✅ Add a New Building
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, floors } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newBuilding = new Building({ name, floors, image: imagePath });
    await newBuilding.save();

    res.status(201).json({ message: "Building added successfully", building: newBuilding });
  } catch (err) {
    res.status(500).json({ error: "Error adding building", message: err.message });
  }
});

// ✅ Get All Buildings
router.get("/", async (req, res) => {
  try {
    const buildings = await Building.find();
    res.status(200).json(buildings || []);
  } catch (err) {
    res.status(500).json({ error: "Error fetching buildings", message: err.message });
  }
});

// ✅ Get Building by ID
router.get("/:id", async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }
    res.status(200).json(building);
  } catch (err) {
    res.status(500).json({ error: "Error fetching building", message: err.message });
  }
});

// ✅ Update Building by ID
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, floors } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    building.name = name || building.name;
    building.floors = floors || building.floors;
    building.image = imagePath || building.image;

    await building.save();

    res.status(200).json({ message: "Building updated successfully", building });
  } catch (err) {
    res.status(500).json({ error: "Error updating building", message: err.message });
  }
});

// ✅ Delete Building by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    // Delete image from server if exists
    if (building.image) {
      const imagePath = path.join(__dirname, "..", building.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Remove image from the server
      }
    }

    await Building.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Building deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting building", message: err.message });
  }
});

// ✅ Generate PDF of All Buildings (with image support)
router.get("/generate-pdf", async (req, res) => {
  try {
    const buildings = await Building.find();
    if (!buildings.length) {
      return res.status(400).json({ error: "No buildings available" });
    }

    const doc = new jsPDF();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="all_buildings.pdf"');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Building Details", 20, 20);
    let yPos = 40;

    // Building details
    buildings.forEach((building, index) => {
      doc.fontSize(12).text(`Building #${index + 1}: ${building.name}`, 20, yPos);
      doc.text(`Floors: ${building.floors}`, 20, yPos + 10);

      if (building.image) {
        const imagePath = path.join(__dirname, "..", building.image);
        if (fs.existsSync(imagePath)) {
          const img = fs.readFileSync(imagePath);
          const imgBase64 = Buffer.from(img).toString("base64");
          doc.addImage(imgBase64, "JPEG", 20, yPos + 20, 60, 40);
        }
      }

      yPos += 80; // Adjust space between buildings
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Error generating PDF", message: err.message });
  }
});

module.exports = router;
