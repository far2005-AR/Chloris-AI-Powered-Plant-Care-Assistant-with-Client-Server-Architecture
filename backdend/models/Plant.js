const { getDB } = require('../database/connection');
const { ObjectId } = require('mongodb');

const Plant = {
    collection: 'plants',

    async create(plantData) {
        const db = getDB();
        const result = await db.collection(this.collection).insertOne(plantData);
        return result;
    },

    async findAll() {
        const db = getDB();
        return await db.collection(this.collection).find({}).toArray();
    },

    async findById(id) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ _id: new ObjectId(id) });
    },

    async findByNames(names) {
        const db = getDB();
        return await db.collection(this.collection).find({ name: { $in: names } }).toArray();
    },

    async search(query) {
        const db = getDB();
        return await db.collection(this.collection).find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { scientific: { $regex: query, $options: 'i' } }
            ]
        }).toArray();
    }
};

module.exports = Plant;