const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./database/connection');

const authRoutes = require('./routes/auth');
const identifyRoutes = require('./routes/identify');
const gardenRoutes = require('./routes/garden');
const recommendationRoutes = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// routes
app.get('/', (req, res) => {
    res.json({ 
        message: '🌱 Chloris API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            identify: '/api/identify',
            garden: '/api/garden',
            recommendations: '/api/recommendations'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/identify', identifyRoutes);
app.use('/api/garden', gardenRoutes);
app.use('/api/recommendations', recommendationRoutes);

// error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong' });
});

// start server
async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🌱 Chloris backend running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();