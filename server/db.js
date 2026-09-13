import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://i4uzats011_db_user:K7X5BETnFdTgTgTE@cluster0.2gn7lxt.mongodb.net/cargo_tracker_v2?appName=Cluster0';
const DB_NAME = process.env.MONGO_DB || 'cargo_tracker_v2';

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;
  try {
    client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[MongoDB] Connected successfully to database: ${DB_NAME}`);
    return db;
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error.message);
    return null;
  }
}

export async function getQuizCollection() {
  const database = await connectDB();
  if (!database) return null;
  return database.collection('kids_quiz_records');
}
