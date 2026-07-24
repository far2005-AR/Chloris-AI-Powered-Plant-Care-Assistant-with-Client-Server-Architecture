const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');
const Plant = require('../models/Plant');
const PlantCare = require('../models/PlantCare');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-flash-latest';

function safeJsonParse(payload) {
    if (!payload) return null;
    if (typeof payload === 'object') return payload;
    try {
        return JSON.parse(payload);
    } catch (err) {
        return null;
    }
}

async function identifyPlant(req, res) {
    try {
        const { imageBase64: rawImageBase64, fileName: bodyFileName, mimeType: bodyMimeType = 'image/jpeg' } = req.body;
        const uploadImage = req.file;

        const imageBase64 = rawImageBase64 || (uploadImage ? uploadImage.buffer.toString('base64') : null);
        const fileName = bodyFileName || (uploadImage ? uploadImage.originalname : 'uploaded_plant.jpg');
        const mimeType = uploadImage ? uploadImage.mimetype : bodyMimeType;

        if (!imageBase64) {
            return res.status(400).json({ error: 'No image provided.' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        }

        const prompt =
            'You are an expert plant identification assistant. Look at this leaf image and respond with valid JSON using the exact keys: plantName, scientificName, diseaseClass, confidence. Confidence should be a number from 0 to 100.';

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType, data: imageBase64 } }
                    ]
                }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'object',
                    properties: {
                        plantName: { type: 'string' },
                        scientificName: { type: 'string' },
                        diseaseClass: { type: 'string' },
                        confidence: { type: 'number' }
                    },
                    required: ['plantName', 'confidence']
                }
            }
        });

        const aiResponse = safeJsonParse(response.text || response);
        const { plantName, scientificName, diseaseClass, confidence } = aiResponse || {};

        if (!plantName || typeof confidence !== 'number') {
            return res.status(502).json({ error: 'AI response was invalid or incomplete.' });
        }

        let careRecord = await PlantCare.findByPlantName(plantName);
        if (!careRecord && scientificName) {
            careRecord = await PlantCare.findByScientific(scientificName);
        }
        if (!careRecord && diseaseClass) {
            careRecord = await PlantCare.findByDiseaseClass(diseaseClass);
        }

        const care = careRecord?.careInfo || {
            light: 'Bright indirect light',
            water: 'Water when the top 2 inches of soil are dry',
            humidity: 'Moderate humidity',
            temperature: '18-27°C'
        };

        let plant = await Plant.findByName(plantName);
        if (!plant) {
            plant = await Plant.create({
                name: plantName,
                scientific: scientificName || '',
                careInfo: care
            });
        }

        return res.json({
            name: plantName,
            scientific: scientificName || 'Unknown',
            confidence,
            diseaseClass: diseaseClass || 'Unknown',
            care
        });
    } catch (error) {
        console.error('AI Identification Error:', error);
        return res.status(500).json({ error: 'Failed to process image and query database.' });
    }
}

function getScoreFromCare(savedCare, candidateCare) {
    if (!savedCare || !candidateCare) return 0;
    let score = 0;
    if (savedCare.light && candidateCare.light && savedCare.light === candidateCare.light) score += 3;
    if (savedCare.water && candidateCare.water && savedCare.water === candidateCare.water) score += 3;
    if (savedCare.humidity && candidateCare.humidity && savedCare.humidity === candidateCare.humidity) score += 2;
    if (savedCare.temperature && candidateCare.temperature && savedCare.temperature === candidateCare.temperature) score += 1;
    return score;
}

async function getRecommendations(req, res) {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const gardenPlantIds = user.garden || [];

        const allPlants = await Plant.findAll();
        const defaultRecommendations = allPlants.slice(0, 4).map((plant) => ({
            name: plant.name,
            scientific: plant.scientific || 'Unknown',
            image: plant.image || null,
            reason: 'Popular plant choice for indoor care'
        }));

        if (gardenPlantIds.length === 0) {
            return res.json({ recommendations: defaultRecommendations });
        }

        const savedPlants = await Plant.findByNames(gardenPlantIds);
        const savedCare = savedPlants.map((plant) => plant.careInfo).filter(Boolean);

        const candidates = allPlants.filter((plant) =>
            !gardenPlantIds.includes(String(plant._id)) && !savedPlants.some((saved) => String(saved._id) === String(plant._id))
        );

        const scored = candidates.map((candidate) => {
            const score = savedCare.reduce((total, care) => total + getScoreFromCare(care, candidate.careInfo), 0);
            return { candidate, score };
        });

        scored.sort((a, b) => b.score - a.score);

        const recommendations = scored.slice(0, 3).map(({ candidate, score }) => ({
            name: candidate.name,
            scientific: candidate.scientific || 'Unknown',
            image: candidate.image || null,
            reason:
                score > 0
                    ? 'Recommended because it matches your saved plants’ care profile.'
                    : 'A good indoor plant with easy care requirements.'
        }));

        if (recommendations.length === 0) {
            return res.json({ recommendations: defaultRecommendations });
        }

        return res.json({ basedOn: savedPlants.map((plant) => plant.name), recommendations });
    } catch (error) {
        console.error('AI Recommendation Error:', error);
        return res.status(500).json({ error: 'Failed to generate recommendations.' });
    }
}

module.exports = {
    identifyPlant,
    getRecommendations
};
