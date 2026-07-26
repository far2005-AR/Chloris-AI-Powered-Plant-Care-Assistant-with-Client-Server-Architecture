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
        console.log('📝 Add to garden request:', req.body);
        const { plantName, careInfo } = req.body;

        if (!plantName) {
            return res.status(400).json({ error: 'Plant name is required' });
        }

        // find or create plant in database
        let plant = await Plant.findByName(plantName);
        console.log('🔍 Plant found:', plant);

        if (!plant) {
            console.log('🌱 Creating new plant:', plantName);
            const result = await Plant.create({ 
                name: plantName,
                careInfo: careInfo || {}
            });
            console.log('📦 Create result:', result);
            
            // fetch the plant with _id
            plant = await Plant.findById(result.insertedId);
            console.log('🌱 Plant after fetch:', plant);
        }

        if (!plant || !plant._id) {
            console.error('❌ Plant has no _id:', plant);
            return res.status(500).json({ error: 'Plant created but no ID found' });
        }

        // add plant ID to user's garden
        console.log('💾 Adding plant to user garden:', req.user.userId, plant._id.toString());
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