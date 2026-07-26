const { MongoClient } = require('mongodb');

let db;

async function connectDB() {
    if (db) return db;

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    db = client.db();

    // THIS PREVENTS DUPLICATE USERS AND PLANTS
    await db.collection('users').createIndex(
        { email: 1 },
        { unique: true }
    );

    await db.collection('plants').createIndex(
        { name: 1 },
        { unique: true }
    );

    console.log('🌱 Connected to MongoDB');
    return db;
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected. Call connectDB() first.');
    }

    return db;
}

module.exports = { connectDB, getDB };
