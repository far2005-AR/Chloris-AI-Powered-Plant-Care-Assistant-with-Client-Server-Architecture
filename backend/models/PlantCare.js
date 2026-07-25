const { getDB } = require('../database/connection');
const { ObjectId } = require('mongodb');

const PlantCare = {
    collection: 'plantcare',

    async create(careData) {
        const db = getDB();
        const result = await db.collection(this.collection).insertOne(careData);
        return result;
    },

    async findByPlantName(name) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ plantName: name });
    },

    async findByScientific(scientificName) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ scientificName });
    },

    async findByDiseaseClass(diseaseClass) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ diseaseClass });
    },

    async findAll() {
        const db = getDB();
        return await db.collection(this.collection).find({}).toArray();
    }
};

module.exports = PlantCare;
