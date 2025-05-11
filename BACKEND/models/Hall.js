const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Hall name is required"],
    trim: true
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: [true, "Building ID is required"]
  },
  floor: {
    type: Number,
    required: [true, "Floor number is required"],
    min: [1, "Floor must be at least 1"]
  },
  capacity: {
    type: Number,
    required: [true, "Capacity is required"],
    min: [1, "Capacity must be a positive number"]
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true // optional: adds createdAt and updatedAt
});

module.exports = mongoose.model('Hall', hallSchema);
