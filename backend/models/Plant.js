const { getDB } = require('../database/connection');
const { ObjectId } = require('mongodb');

const Plant = {
    collection: 'plants',

    async create(plantData) {
        const db = getDB();
        const result = await db.collection(this.collection).insertOne(plantData);
        return result;  
    },

    async findById(id) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ _id: new ObjectId(id) });
    },

    async findByName(name) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ name: name });
    },

    async findByNames(names) {
        const db = getDB();
        return await db.collection(this.collection).find({ _id: { $in: names.map(id => new ObjectId(id)) } }).toArray();
    },

    async findAll() {
        const db = getDB();
        return await db.collection(this.collection).find({}).toArray();
    }
};

module.exports = Plant;