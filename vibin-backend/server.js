import cors from 'cors';
require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors({
  origin: ['http://localhost:5173'], // Your frontend URL
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const messageSchema = new mongoose.Schema({
  room: String,
  text: String,
  sender: String,
  username: String,
  timestamp: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  users: [{
    socketId: String,
    username: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  messageCount: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  username: String,
  rooms: { type: [String], default: [] },
  lastActive: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);
const Room = mongoose.model('Room', roomSchema);
const User = mongoose.model('User', userSchema);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize default rooms on server start
async function initializeRooms() {
  const defaultRooms = ['music', 'movies', 'tvshows', 'books', 'games', 'beauty'];
  try {
    for (const room of defaultRooms) {
      await Room.findOneAndUpdate(
        { name: room },
        { $setOnInsert: { name: room } },
        { upsert: true, new: true }
      );
    }
    console.log('Default rooms initialized');
  } catch (err) {
    console.error('Error initializing rooms:', err);
  }
}

initializeRooms();

// Helper function to get unique active users
function getUniqueActiveUsers(roomName) {
  const room = io.sockets.adapter.rooms.get(roomName);
  if (!room) return [];

  const uniqueUsers = new Map();
  
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket?.username) {
      if (!uniqueUsers.has(socket.username)) {
        uniqueUsers.set(socket.username, {
          socketId,
          username: socket.username
        });
      }
    }
  }

  return Array.from(uniqueUsers.values());
}

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);
  socket.username = `User-${socket.id.slice(0, 4)}`; // Default username

  // Handle username setting
  socket.on("set_username", async (username) => {
    try {
      socket.username = username || `User-${socket.id.slice(0, 4)}`;
      console.log(`Username set for ${socket.id}: ${socket.username}`);
      
      // Update user in database if authenticated
      if (socket.auth0Id) {
        await User.findOneAndUpdate(
          { auth0Id: socket.auth0Id },
          { username: socket.username, lastActive: new Date() },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error('Error setting username:', err);
    }
  });

  // Handle authentication
  socket.on("authenticate", async (auth0Id) => {
    try {
      socket.auth0Id = auth0Id;
      const user = await User.findOneAndUpdate(
        { auth0Id },
        { lastActive: new Date() },
        { upsert: true, new: true }
      );
      
      // Join rooms the user was previously in
      user.rooms.forEach(room => {
        socket.join(room);
      });
      
    } catch (err) {
      console.error('Authentication error:', err);
    }
  });

  socket.on("join_room", async (roomName) => {
    try {
      socket.join(roomName);
      
      // Update room in MongoDB
      const updatedRoom = await Room.findOneAndUpdate(
        { name: roomName },
        { 
          $addToSet: { 
            users: { 
              socketId: socket.id,
              username: socket.username,
              joinedAt: new Date()
            } 
          } 
        },
        { new: true, upsert: true }
      );

      // Update user's rooms if authenticated
      if (socket.auth0Id) {
        await User.findOneAndUpdate(
          { auth0Id: socket.auth0Id },
          { $addToSet: { rooms: roomName }, lastActive: new Date() }
        );
      }

      // Get last 50 messages from DB
      const messages = await Message.find({ room: roomName })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      // Get unique active users
      const activeUsers = getUniqueActiveUsers(roomName);

      // Send previous messages and current user list
      socket.emit("previous_messages", messages.reverse());
      io.to(roomName).emit("users_in_room", activeUsers);

      // Notify others in the room
      socket.broadcast.to(roomName).emit("user_joined", {
        userId: socket.id,
        username: socket.username,
        usersCount: activeUsers.length
      });

      console.log(`${socket.username} joined ${roomName}`);
    } catch (err) {
      console.error('Error joining room:', err);
    }
  });

  socket.on("send_message", async ({ room, text }) => {
    try {
      const message = new Message({
        room,
        text,
        sender: socket.id,
        username: socket.username,
        timestamp: new Date()
      });

      // Save to MongoDB
      const savedMessage = await message.save();

      // Update message count in room
      await Room.findOneAndUpdate(
        { name: room },
        { $inc: { messageCount: 1 } }
      );

      // Broadcast to room
      io.to(room).emit("receive_message", savedMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    try {
      // Get all rooms the user was in
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      
      // Remove user from MongoDB rooms
      await Room.updateMany(
        { "users.socketId": socket.id },
        { $pull: { users: { socketId: socket.id } } }
      );

      // Update user's last active time if authenticated
      if (socket.auth0Id) {
        await User.findOneAndUpdate(
          { auth0Id: socket.auth0Id },
          { lastActive: new Date() }
        );
      }

      // Update active users for each room
      rooms.forEach(roomName => {
        const activeUsers = getUniqueActiveUsers(roomName);
        io.to(roomName).emit("users_in_room", activeUsers);
      });
    } catch (err) {
      console.error('Error handling disconnect:', err);
    }
  });
});

// API endpoint to get room statistics
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().select('name users messageCount');
    
    // Filter to only show currently active users
    const roomsWithActiveUsers = rooms.map(room => {
      const activeUsers = getUniqueActiveUsers(room.name);
      return {
        ...room._doc,
        activeUsersCount: activeUsers.length,
        activeUsers
      };
    });

    res.json(roomsWithActiveUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// API endpoint to get user's joined rooms
app.get('/api/users/:auth0Id/rooms', async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.auth0Id });
    res.json({ rooms: user?.rooms || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user rooms' });
  }
});

// API endpoint to update user's rooms
app.post('/api/users/:auth0Id/rooms', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { auth0Id: req.params.auth0Id },
      { $set: { rooms: req.body.rooms }, lastActive: new Date() },
      { new: true, upsert: true }
    );
    res.json({ rooms: user.rooms });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user rooms' });
  }
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});