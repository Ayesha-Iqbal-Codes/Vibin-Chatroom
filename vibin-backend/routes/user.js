import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get user's rooms
router.get('/:userId/rooms', async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ rooms: user.joinedRooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user's rooms
// Updated routes to match the model
router.post('/:userId/rooms', async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { auth0Id: req.params.userId },
        { 
          $set: { rooms: req.body.rooms },
          $currentDate: { updatedAt: true }
        },
        { new: true, upsert: true }
      );
      
      res.json({ 
        success: true,
        rooms: user.rooms 
      });
      
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to update rooms',
        error: error.message 
      });
    }
  });

export default router;