const { getDB } = require('../database/connection');
const { ObjectId } = require('mongodb');

const User = {
    collection: 'users',

    async create(userData) {
        const db = getDB();
        const result = await db.collection(this.collection).insertOne(userData);
        return result;
    },

    async findByEmail(email) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ email });
    },

    async findById(id) {
        const db = getDB();
        return await db.collection(this.collection).findOne({ _id: new ObjectId(id) });
    },

    async updateGarden(userId, plantId) {
        const db = getDB();
        return await db.collection(this.collection).updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { garden: plantId } } // add to garden if it doesnt exist
        );
    },

    async removeFromGarden(userId, plantId) {
        const db = getDB();
        return await db.collection(this.collection).updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { garden: plantId } } // remove from garden
        );
    }
};

module.exports = User;