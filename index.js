import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// MongoDB Connection
console.log("Attempting to connect to MongoDB...");
if (!process.env.MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in .env file!");
} else {
    console.log("MONGO_URI found. Connecting...");
}

mongoose.connection.on('connected', () => console.log('Mongoose connected to DB Cluster'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
    .then(() => console.log("MongoDB Connection Promise Resolved"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Schema
const ScoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

// Routes

// Get High Score
app.get('/api/highscore', async (req, res) => {
    try {
        const highScore = await Score.findOne().sort({ score: -1 });
        console.log("High Score:", highScore);
        res.json(highScore || { score: 0, name: 'None' });
    } catch (err) {
        console.error("Error fetching high score:", err);
        // Fallback to 0 if database fails, so the game doesn't crash
        res.status(200).json({ score: 0, name: 'None' });
    }
});

// Submit Score
app.post('/api/score', async (req, res) => {
    const { name, score } = req.body;
    console.log("Received score:", { name, score });
    try {
        const newScore = new Score({ name, score });
        await newScore.save();
        res.status(201).json(newScore);
    } catch (err) {
        console.error("Error submitting score:", err);
        res.status(400).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
