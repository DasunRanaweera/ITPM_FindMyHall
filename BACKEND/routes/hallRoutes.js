const express = require("express");
const router = express.Router();
const Hall = require("../models/Hall");
const Building = require("../models/building");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Multer storage configuration for image uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Middleware to validate hall data
const validateHall = (req, res, next) => {
  const { name, building, floor } = req.body;
  if (!name || !building || !floor) {
    return res.status(400).json({ error: "Hall name, building, and floor are required" });
  }
  if (isNaN(floor) || floor < 1) {
    return res.status(400).json({ error: "Floor must be a positive number" });
  }
  next();
};

// Serve static uploads directory
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ✅ Add a New Hall
router.post("/add", upload.single("image"), validateHall, async (req, res) => {
  try {
    const { name, building, floor, capacity } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const buildingExists = await Building.findById(building);
    if (!buildingExists) {
      return res.status(400).json({ error: "Building not found" });
    }

    if (floor > buildingExists.floors) {
      return res.status(400).json({ error: "Floor number exceeds building's total floors" });
    }

    const newHall = new Hall({ name, building, floor, capacity, image: imagePath });
    await newHall.save();

    res.status(201).json({ message: "Hall added successfully", hall: newHall });
  } catch (err) {
    res.status(500).json({ error: "Error adding hall", message: err.message });
  }
});

// ✅ Get All Halls with Building Details
router.get("/", async (req, res) => {
  try {
    const halls = await Hall.find().populate('building', 'name floors');
    res.status(200).json(halls || []);
  } catch (err) {
    res.status(500).json({ error: "Error fetching halls", message: err.message });
  }
});

// Search halls by name or building name
router.get("/search", async (req, res) => {
    try {
        console.log("Search request received:", req.query);
        const { query } = req.query;
        
        if (!query) {
            console.log("No query provided");
            return res.status(400).json({ error: "Search query is required" });
        }

        console.log("Searching for:", query);
        const searchResults = await Hall.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { 'building.name': { $regex: query, $options: 'i' } }
            ]
        }).populate('building');

        console.log("Search results:", searchResults);
        res.status(200).json(searchResults);
    } catch (err) {
        console.error("Detailed search error:", err);
        res.status(500).json({ 
            error: "Error searching halls", 
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Get hall by ID (with validation)
router.get("/:id", async (req, res) => {
    try {
        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid hall ID format" });
        }

        const hall = await Hall.findById(req.params.id).populate('building');
        
        if (!hall) {
            return res.status(404).json({ error: "Hall not found" });
        }

        res.status(200).json(hall);
    } catch (err) {
        console.error("Error fetching hall:", err);
        res.status(500).json({ error: "Error fetching hall", message: err.message });
    }
});

// ✅ Update a Hall by ID
router.put("/update/:id", upload.single("image"), validateHall, async (req, res) => {
  try {
    const { name, building, floor, capacity } = req.body;
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({ error: "Hall not found" });
    }

    const buildingExists = await Building.findById(building);
    if (!buildingExists) {
      return res.status(400).json({ error: "Building not found" });
    }

    if (floor > buildingExists.floors) {
      return res.status(400).json({ error: "Floor number exceeds building's total floors" });
    }

    hall.name = name || hall.name;
    hall.building = building || hall.building;
    hall.floor = floor || hall.floor;
    hall.capacity = capacity || hall.capacity;
    if (req.file) {
      hall.image = `/uploads/${req.file.filename}`;
    }

    await hall.save();
    res.status(200).json({ message: "Hall updated successfully", hall });
  } catch (err) {
    res.status(500).json({ error: "Error updating hall", message: err.message });
  }
});

// ✅ Delete a Hall by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid hall ID" });
    }
    const deletedHall = await Hall.findByIdAndDelete(req.params.id);
    if (!deletedHall) {
      return res.status(404).json({ error: "Hall not found" });
    }
    res.status(200).json({ message: "Hall deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting hall", message: err.message });
  }
});

// ✅ Generate PDF for All Halls
router.get("/generate-pdf", async (req, res) => {
  try {
    const halls = await Hall.find().populate('building', 'name');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=hall_details.pdf');
    doc.pipe(res);

    doc.fontSize(20).text("Hall Details", { align: "center" });
    doc.moveDown();

    const startX = 50;
    const startY = 100;
    const rowHeight = 30;
    const col1 = 100;
    const col2 = 200;
    const col3 = 350;

    doc.font('Helvetica-Bold');
    doc.text("Name", startX, startY);
    doc.text("Building", col1, startY);
    doc.text("Floor", col2, startY);
    doc.text("Image Path", col3, startY);
    doc.moveTo(startX, startY + rowHeight - 10).lineTo(col3 + 100, startY + rowHeight - 10).stroke();

    doc.font('Helvetica');
    let y = startY + rowHeight;

    halls.forEach((hall, index) => {
      doc.text(hall.name, startX, y);
      doc.text(hall.building?.name || 'N/A', col1, y);
      doc.text(hall.floor.toString(), col2, y);
      doc.text(hall.image || "No image", col3, y);

      if (index < halls.length - 1) {
        doc.moveTo(startX, y + rowHeight - 10).lineTo(col3 + 100, y + rowHeight - 10).stroke();
      }

      y += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Error generating PDF", message: err.message });
  }
});

module.exports = router;