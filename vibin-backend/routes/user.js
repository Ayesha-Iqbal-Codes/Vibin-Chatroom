// routes/users.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get user's rooms
router.get('/:userId/rooms', async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.userId });
    if (!user) return res.status(404).send('User not found');
    res.json({ rooms: user.rooms });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update user's rooms
router.post('/:userId/rooms', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { auth0Id: req.params.userId },
      { $set: { rooms: req.body.rooms } },
      { new: true, upsert: true }
    );
    res.json({ rooms: user.rooms });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;