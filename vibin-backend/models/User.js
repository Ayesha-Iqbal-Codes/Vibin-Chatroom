// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String 
  },
  picture: { 
    type: String 
  },
  username: {
    type: String,
    default: function() {
      // Default username based on auth0Id if not provided
      return `User-${this.auth0Id.slice(0, 4)}`;
    }
  },
  rooms: { 
    type: [String], 
    default: [] 
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find or create user
userSchema.statics.findOrCreate = async function(auth0Id, userData) {
  let user = await this.findOne({ auth0Id });
  if (!user) {
    user = new this({
      auth0Id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      // Other fields can be added here
    });
    await user.save();
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);