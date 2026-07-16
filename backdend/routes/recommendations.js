const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Plant = require('../models/Plant');
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// GET recommendations based on user's garden
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const gardenPlants = user.garden || [];

        // if the user has no plants, return default recommendations
        if (gardenPlants.length === 0) {
            const defaultPlants = await Plant.findAll();
            const recommendations = defaultPlants.slice(0, 4).map(p => ({
                name: p.name,
                scientific: p.scientific,
                reason: 'Popular plant choice',
                image: p.image
            }));
            return res.json({ recommendations });
        }

        // TO DO: Replace with actual AI recommendation logic
        // for now, just return mock recommendations based on their garden
        const mockRecommendations = [
            {
                name: 'Snake Plant',
                scientific: 'Sansevieria trifasciata',
                reason: 'Similar care needs to your plants',
                image: '/assets/snake-plant.jpg'
            },
            {
                name: 'Pothos',
                scientific: 'Epipremnum aureum',
                reason: 'Recommended by plant experts',
                image: '/assets/pothos.jpg'
            },
            {
                name: 'ZZ Plant',
                scientific: 'Zamioculcas zamiifolia',
                reason: 'Perfect for indoor environments',
                image: '/assets/zz-plant.jpg'
            },
            {
                name: 'Peace Lily',
                scientific: 'Spathiphyllum',
                reason: 'Great for air purification',
                image: '/assets/peace-lily.jpg'
            }
        ];

        res.json({ recommendations: mockRecommendations });

    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

module.exports = router;