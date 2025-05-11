const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const hallRoutes = require('./routes/hallRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hallDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to FindMyHall API' });
});

// Hall routes
app.use('/hall', hallRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8070;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 