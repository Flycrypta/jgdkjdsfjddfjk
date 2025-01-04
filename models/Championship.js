const mongoose = require('mongoose');

const championshipSchema = new mongoose.Schema({
    name: String,
    season: Number,
    tracks: [{
        trackId: String,
        date: Date,
        weatherOverride: String
    }],
    participants: [{
        userId: String,
        points: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        carId: String
    }],
    rules: {
        performanceTierLimit: String,
        allowedMods: [String],
        pointSystem: {
            first: { type: Number, default: 25 },
            second: { type: Number, default: 18 },
            third: { type: Number, default: 15 }
        }
    },
    status: { type: String, enum: ['upcoming', 'active', 'completed'] },
    prize: {
        credits: Number,
        items: [{
            type: String,
            quantity: Number
        }]
    }
});

module.exports = mongoose.model('Championship', championshipSchema);
