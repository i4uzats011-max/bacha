import express from 'express';
import cors from 'cors';
import { connectDB, getQuizCollection } from '../server/db.js';

const app = express();
app.use(cors());
app.use(express.json());

const memoryRecords = [];

// Health and DB check
app.get('/api/health', async (req, res) => {
  const db = await connectDB();
  res.json({
    status: 'ok',
    database: db ? 'connected' : 'offline',
    timestamp: new Date().toISOString(),
  });
});

// Save match record
app.post('/api/records', async (req, res) => {
  try {
    const record = {
      ...req.body,
      createdAt: new Date(),
    };

    const collection = await getQuizCollection();
    if (collection) {
      const result = await collection.insertOne(record);
      return res.status(201).json({ success: true, id: result.insertedId, source: 'mongodb' });
    } else {
      memoryRecords.unshift(record);
      return res.status(201).json({ success: true, source: 'memory' });
    }
  } catch (error) {
    console.error('[API] Error saving record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch match records
app.get('/api/records', async (req, res) => {
  try {
    const collection = await getQuizCollection();
    if (collection) {
      const records = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
      return res.json(records);
    } else {
      return res.json(memoryRecords);
    }
  } catch (error) {
    console.error('[API] Error fetching records:', error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
