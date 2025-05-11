const express = require("express");
const router = express.Router();
const Announce = require("../models/announcement");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

// Middleware to validate announcement data
const validateAnnouncement = (req, res, next) => {
    const { announce, date } = req.body;
    if (!announce || !date) {
        return res.status(400).json({ error: "Announcement and date are required" });
    }
    if (isNaN(Date.parse(date))) {
        return res.status(400).json({ error: "Date must be a valid date" });
    }
    next();
};

// ✅ Add a New Announcement
router.post("/add", validateAnnouncement, async (req, res) => {
    try {
        const { announce, date } = req.body;
        const newAnnouncement = new Announce({ announce, date: new Date(date) });
        await newAnnouncement.save();
        res.status(201).json({ message: "Announcement added successfully", announcement: newAnnouncement });
    } catch (err) {
        console.error("Error adding announcement:", err);
        res.status(500).json({ error: "Error adding announcement", message: err.message });
    }
});

// ✅ Get All Announcements
router.get("/", async (req, res) => {
    try {
        const announcements = await Announce.find();
        res.status(200).json(announcements || []);
    } catch (err) {
        console.error("Error fetching announcements:", err);
        res.status(500).json({ error: "Error fetching announcements", message: err.message });
    }
});

// ✅ Update an Announcement by ID (Fixed)
router.put("/update/:id", validateAnnouncement, async (req, res) => {
    try {
        const { id } = req.params;
        const { announce, date } = req.body;

        console.log("🔹 Updating Announcement ID:", id);
        console.log("🔹 Received Data:", { announce, date });

        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid announcement ID" });
        }

        // Find the announcement first to ensure it exists
        const existingAnnouncement = await Announce.findById(id);
        if (!existingAnnouncement) {
            return res.status(404).json({ error: "Announcement not found" });
        }

        // Update the announcement
        existingAnnouncement.announce = announce;
        existingAnnouncement.date = new Date(date);
        await existingAnnouncement.save();

        console.log("🔹 Successfully updated announcement:", existingAnnouncement);
        res.status(200).json({ 
            message: "Announcement updated successfully", 
            announcement: existingAnnouncement 
        });
    } catch (err) {
        console.error("Error updating announcement:", err);
        res.status(500).json({ 
            error: "Error updating announcement", 
            message: err.message,
            details: err 
        });
    }
});

// ✅ Generate a Single PDF for All Announcements
router.get("/generate-pdf", async (req, res) => {
    try {
        const announcements = await Announce.find();
        if (!announcements.length) {
            return res.status(400).json({ error: "No announcements available" });
        }

        // Create a PDF document
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="all_announcements.pdf"');

        doc.pipe(res);

        // Add Title
        doc.fontSize(20).text("All Announcements", { align: "center" }).moveDown();

        // Add each announcement to the PDF
        announcements.forEach((announcement, index) => {
            doc.fontSize(14).text(`📢 Announcement ${index + 1}:`, { underline: true }).moveDown(0.5);
            doc.fontSize(12).text(`Message: ${announcement.announce}`).moveDown(0.2);
            doc.fontSize(12).text(`Date: ${new Date(announcement.date).toLocaleString()}`).moveDown(1);
        });

        // Finalize PDF
        doc.end();
    } catch (err) {
        console.error("Error generating PDF:", err);
        res.status(500).json({ error: "Error generating PDF", message: err.message });
    }
});

// ✅ Delete an Announcement by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid announcement ID" });
        }

        // Delete announcement
        const deletedAnnouncement = await Announce.findByIdAndDelete(id);
        if (!deletedAnnouncement) {
            return res.status(404).json({ error: "Announcement not found" });
        }

        res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (err) {
        console.error("Error deleting announcement:", err);
        res.status(500).json({ error: "Error deleting announcement", message: err.message });
    }
});

module.exports = router;
