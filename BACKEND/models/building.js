const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const buildingSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    floors: {
        type: Number,
        required: true
    },
    image: {
        type: String,  // Store image URL or file path
        required: false
    }
});

const Building = mongoose.model("Building", buildingSchema);

module.exports = Building;
