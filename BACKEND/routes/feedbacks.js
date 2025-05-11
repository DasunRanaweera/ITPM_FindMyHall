const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback"); // Assuming the model file is feedback.js
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

// Middleware to validate feedback data
const validateFeedback = (req, res, next) => {
    const { name, feedback, userId } = req.body;
    if (!name || !feedback || !userId) {
        return res.status(400).json({ error: "Name, feedback, and userId are required" });
    }
    next();
};

// ✅ Add New Feedback
router.post("/add", validateFeedback, async (req, res) => {
    try {
        const { name, feedback, userId } = req.body;
        const newFeedback = new Feedback({ 
            name, 
            feedback, 
            userId,
            date: new Date() 
        });
        await newFeedback.save();
        res.status(201).json({ message: "Feedback added successfully", feedback: newFeedback });
    } catch (err) {
        res.status(500).json({ error: "Error adding feedback", message: err.message });
    }
});

// ✅ Update Feedback
router.put("/update/:id", validateFeedback, async (req, res) => {
    try {
        const { name, feedback, userId } = req.body;
        const feedbackId = req.params.id;

        // Find the feedback and check if it belongs to the user
        const existingFeedback = await Feedback.findById(feedbackId);
        if (!existingFeedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        // Check if user is admin or the owner of the feedback
        if (existingFeedback.userId !== userId && userId !== 'Admin01@gmail.com') {
            return res.status(403).json({ error: "Not authorized to update this feedback" });
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            { name, feedback },
            { new: true }
        );

        res.status(200).json({ message: "Feedback updated successfully", feedback: updatedFeedback });
    } catch (err) {
        res.status(500).json({ error: "Error updating feedback", message: err.message });
    }
});

// ✅ Get All Feedbacks for a specific user
router.get("/user/:userId", async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ userId: req.params.userId });
        res.status(200).json(feedbacks || []);
    } catch (err) {
        res.status(500).json({ error: "Error fetching feedbacks", message: err.message });
    }
});

// ✅ Get All Feedbacks (admin only)
router.get("/", async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json(feedbacks || []);
    } catch (err) {
        res.status(500).json({ error: "Error fetching feedbacks", message: err.message });
    }
});

// ✅ Generate PDF for all Feedbacks
router.get("/generate-pdf", async (req, res) => {
    try {
        // Fetch all feedbacks
        const feedbacks = await Feedback.find();
        if (feedbacks.length === 0) {
            return res.status(404).json({ error: "No feedbacks found to generate PDF" });
        }

        // Create a PDF document
        const doc = new PDFDocument();
        let filename = `feedbacks_${Date.now()}.pdf`;
        filename = encodeURIComponent(filename);

        // Set the response header to indicate that it's a PDF file
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

        // Pipe the document to the response
        doc.pipe(res);

        // Add a title to the PDF
        doc.fontSize(20).text("Feedbacks Report", { align: "center" });
        doc.moveDown();

        // Loop through the feedbacks and add them to the PDF
        feedbacks.forEach((feedback, index) => {
            doc.fontSize(12).text(`Feedback #${index + 1}:`, { underline: true });
            doc.fontSize(10).text(`Name: ${feedback.name}`);
            doc.fontSize(10).text(`Feedback: ${feedback.feedback}`);
            doc.fontSize(10).text(`Date: ${new Date(feedback.date).toLocaleString()}`);
            doc.moveDown();
        });

        // Finalize the PDF and send it to the client
        doc.end();
    } catch (err) {
        res.status(500).json({ error: "Error generating PDF", message: err.message });
    }
});

// ✅ Delete Feedback by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!deletedFeedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }
        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting feedback", message: err.message });
    }
});

module.exports = router;
