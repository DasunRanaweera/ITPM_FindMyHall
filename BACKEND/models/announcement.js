const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const announceSchema = new Schema({
    announce: {
        type: String,  // Corrected type to 'String' (capitalized)
        required: true
    },
    date: {
        type: Date,  // Corrected type to 'Date' (capitalized)
        required: true
    }
});

const Announce = mongoose.model("Announcement", announceSchema);  // Fixed typo here

module.exports = Announce;  // Exporting the model for use in other parts of your app
