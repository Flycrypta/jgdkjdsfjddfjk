import mongoose from 'mongoose';

// User Schema Updates
const UserSchema = new mongoose.Schema({
    // ...existing code...
    jobs: [{
        type: String,
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        lastWorked: Date,
        skills: [{
            name: String,
            level: { type: Number, default: 1 }
        }]
    }],
    banking: {
        savings: {
            balance: { type: Number, default: 0 },
            lastInterest: { type: Date, default: Date.now },
            transactions: [{
                type: String,
                amount: Number,
                date: { type: Date, default: Date.now }
            }]
        },
        checking: {
            balance: { type: Number, default: 0 },
            transactions: [{
                type: String,
                amount: Number,
                date: { type: Date, default: Date.now }
            }]
        }
    }
});
