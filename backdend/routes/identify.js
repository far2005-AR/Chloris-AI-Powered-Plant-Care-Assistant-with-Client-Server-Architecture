const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');

// MOCK identification — later replace with real AI API
router.post('/', async (req, res) => {
    try {
        const { imageUrl } = req.body;

        // TODO: replace this with actual AI Plant ID API call
        // for now we just return a mock response
        const mockResult = {
            name: 'Monstera Deliciosa',
            scientific: 'Monstera deliciosa',
            confidence: 94,
            care: {
                light: 'Indirect bright light',
                water: 'Water when top 2 inches of soil are dry',
                humidity: 'High humidity preferred',
                temperature: '18-27°C'
            }
        };

        res.json(mockResult);

    } catch (error) {
        console.error('Identification error:', error);
        res.status(500).json({ error: 'Failed to identify plant' });
    }
});

module.exports = router;