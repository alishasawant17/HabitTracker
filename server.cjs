const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection with Authentication
mongoose.connect('mongodb://admin:password@localhost:27017/habitdb2?authSource=admin', {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true
})
.then(() => console.log('🟢 MongoDB Connected'))
.catch(err => console.error('🔴 MongoDB Connection Error:', err.message));

// Habit Schema
const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Habit = mongoose.model('Habit', habitSchema);

// Enhanced CRUD Endpoints
app.post('/api/habits', async (req, res) => {
  try {
    const habit = new Habit({
      name: req.body.name,
      category: req.body.category,
      tags: req.body.tags?.filter(t => t) || [] // Remove empty tags
    });
    await habit.save();
    res.status(201).json(habit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

app.put('/api/habits/:id', async (req, res) => {
  try {
    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(updatedHabit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/habits/:id', async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));