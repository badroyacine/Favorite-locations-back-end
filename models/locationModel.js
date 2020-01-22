const mongoose = require('mongoose');
const User = require('./userModel');

const locationSchema = new mongoose.Schema({
    locationName: {
        type: String,
        trim: true,
        required: [true, 'locationName can not be empty']
    },
    comment: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
    latitude: {
        type: Number,
        required: [true, 'latitude can not be empty']
    },
    longitude: {
        type: Number,
        required: [true, 'longitude can not be empty']
    },
    // Parent referencing with Loaction and User
    user: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;