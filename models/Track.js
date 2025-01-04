import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
    name: String,
    type: { type: String, enum: ['street', 'circuit', 'drift', 'drag', 'rally', 'mountain'] },
    length: Number,
    difficulty: { type: Number, min: 1, max: 10 },
    environment: {
        surface: { type: String, enum: ['asphalt', 'dirt', 'snow', 'mixed'] },
        elevation: {
            min: Number,
            max: Number
        },
        corners: {
            total: Number,
            difficulty: { type: Number, min: 1, max: 10 }
        }
    },
    weatherConditions: [{
        type: String,
        probability: Number
    }],
    leaderboard: [{
        userId: String,
        carId: String,
        time: Number,
        date: Date,
        weather: String
    }]
});

export default mongoose.model('Track', trackSchema);
