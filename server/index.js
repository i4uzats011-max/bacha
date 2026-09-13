import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getQuizCollection } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback if MongoDB connection is temporarily unreachable
const memoryRecords = [];

// Health and DB connection check
app.get('/api/health', async (req, res) => {
  const db = await connectDB();
  res.json({
    status: 'ok',
    database: db ? 'connected' : 'offline (using local storage)',
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
      // Fallback
      memoryRecords.unshift(record);
      return res.status(201).json({ success: true, source: 'memory_fallback' });
    }
  } catch (error) {
    console.error('[API] Error saving record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all match records
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

// Get aggregated player stats for parent dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const collection = await getQuizCollection();
    let records = [];
    if (collection) {
      records = await collection.find({}).toArray();
    } else {
      records = memoryRecords;
    }

    // Aggregate statistics
    const stats = {
      totalMatches: records.length,
      ammeya: {
        name: 'Ammeya',
        totalStars: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        subjectsPlayed: {},
      },
      ahil: {
        name: 'Ahil',
        totalStars: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        subjectsPlayed: {},
      },
      recentMatches: records.slice(-10).reverse(),
    };

    records.forEach((rec) => {
      if (rec.p1) {
        stats.ammeya.totalStars += rec.p1.score || 0;
        stats.ammeya.correctAnswers += rec.p1.correctAnswers || 0;
        stats.ammeya.totalQuestions += rec.p1.totalAnswered || 0;
        const sub = rec.subject || 'all';
        stats.ammeya.subjectsPlayed[sub] = (stats.ammeya.subjectsPlayed[sub] || 0) + 1;
      }
      if (rec.p2) {
        stats.ahil.totalStars += rec.p2.score || 0;
        stats.ahil.correctAnswers += rec.p2.correctAnswers || 0;
        stats.ahil.totalQuestions += rec.p2.totalAnswered || 0;
        const sub = rec.subject || 'all';
        stats.ahil.subjectsPlayed[sub] = (stats.ahil.subjectsPlayed[sub] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('[API] Error calculating stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(`[Express] Server running on port ${PORT}`);
  await connectDB();
});
