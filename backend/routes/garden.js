const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Plant = require('../models/Plant');
const jwt = require('jsonwebtoken');

// middleware to verify JWT
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

// GET user's garden
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // get full plant details for each plant ID in garden
        const plants = await Plant.findByNames(user.garden || []);
        res.json({ garden: plants });

    } catch (error) {
        console.error('Garden error:', error);
        res.status(500).json({ error: 'Failed to fetch garden' });
    }
});

// add plant to garden
router.post('/', verifyToken, async (req, res) => {
    try {
        const { plantId, plantName, careInfo } = req.body;
        let plant = null;

        if (plantId) {
            plant = await Plant.findById(plantId);
            if (!plant) {
                plant = await Plant.findByName(plantId);
            }
        }

        if (!plant && plantName) {
            plant = await Plant.findByName(plantName);
        }

        if (!plant && !plantName && !plantId) {
            return res.status(400).json({ error: 'No plant identifier provided' });
        }

        if (!plant) {
            const name = plantName || plantId;
            plant = await Plant.create({
                name,
                careInfo: careInfo || {}
            });
        }

        await User.updateGarden(req.user.userId, plant._id.toString());

        res.json({ message: 'Plant added to garden', plant });

    } catch (error) {
        console.error('Add to garden error:', error);
        res.status(500).json({ error: 'Failed to add plant' });
    }
});

// remove plant from garden
router.delete('/:plantId', verifyToken, async (req, res) => {
    try {
        await User.removeFromGarden(req.user.userId, req.params.plantId);
        res.json({ message: 'Plant removed from garden' });
    } catch (error) {
        console.error('Remove from garden error:', error);
        res.status(500).json({ error: 'Failed to remove plant' });
    }
});

module.exports = router;