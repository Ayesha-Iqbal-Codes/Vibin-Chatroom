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

// Indexes
userSchema.index({ auth0Id: 1 }, { unique: true });
userSchema.index({ email: 1 });

// Pre-save hook
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods
userSchema.statics.findOrCreate = async function(auth0Id, userData) {
  return this.findOneAndUpdate(
    { auth0Id },
    {
      $setOnInsert: {
        auth0Id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        rooms: []
      },
      $set: {
        lastActive: Date.now(),
        updatedAt: Date.now()
      }
    },
    { upsert: true, new: true }
  );
};

// Instance methods
userSchema.methods.addRoom = function(room) {
  if (!this.rooms.includes(room)) {
    this.rooms.push(room);
  }
  return this.save();
};

userSchema.methods.removeRoom = function(room) {
  this.rooms = this.rooms.filter(r => r !== room);
  return this.save();
};

module.exports = mongoose.model('User', userSchema);