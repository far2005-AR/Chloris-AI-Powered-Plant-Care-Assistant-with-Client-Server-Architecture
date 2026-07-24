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

    async findByName(name) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ name });
    },

    async findByNames(names) {
        const db = getDB();
        if (!Array.isArray(names) || names.length === 0) return [];

        const objectIds = names
            .filter((value) => typeof value === 'string' && value.length === 24)
            .map((value) => {
                try {
                    return new ObjectId(value);
                } catch (err) {
                    return null;
                }
            })
            .filter(Boolean);

        const query = {
            $or: [
                { name: { $in: names } },
                ...(objectIds.length ? [{ _id: { $in: objectIds } }] : [])
            ]
        };

        return await db.collection(this.collection).find(query).toArray();
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