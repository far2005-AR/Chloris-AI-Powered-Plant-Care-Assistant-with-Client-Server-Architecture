const { getDB } = require('../database/connection');
const { ObjectId } = require('mongodb');

const User = {
    collection: 'users',

    async create(userData) {
        const db = getDB();

        const user = {
            ...userData,
            email: userData.email.trim().toLowerCase(),  //KARIM: CHANGE TO ENSURE LOWERCASE EMAILS AND UPPERCASE ARE TREATED THE SAME
            garden: [],
            createdAt: new Date()
        };

        return await db.collection(this.collection).insertOne(user); //KARIM: CHANGE, NO NEED TO STORE "RESULT", THIS JUST CLEANS CODE A LITTLE
    },

    async findByEmail(email) {
        const db = getDB();

        return await db.collection(this.collection).findOne({
            email: email.trim().toLowerCase() //KARIM: PT2 CHANGE TO ENSURE LOWERCASE EMAILS AND UPPERCASE ARE TREATED THE SAME
        });
    },

    async findById(id) {
        const db = getDB();

        return await db.collection(this.collection).findOne({
            _id: new ObjectId(id)
        });
    },

    async updateGarden(userId, plantId) {
        const db = getDB();

        return await db.collection(this.collection).updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { garden: plantId } } // Add only if it doesn't exist
        );
    },

    async removeFromGarden(userId, plantId) {
        const db = getDB();

        return await db.collection(this.collection).updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { garden: plantId } } // Remove plant from garden
        );
    }
};

module.exports = User;
