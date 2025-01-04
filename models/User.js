import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 1000 },
    experience: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    jobExperience: {
        driver: { type: Number, default: 0 },
        mechanic: { type: Number, default: 0 },
        dealer: { type: Number, default: 0 },
        // ... other jobs
    },
    lastWorked: { type: Date },
    inventory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }],
    activeRace: {
        type: Boolean,
        default: false
    },
    tradeBanned: {
        type: Boolean,
        default: false
    },
    godModeActive: { type: Boolean, default: false },
    godModeExpires: { type: Date, default: null },
    lastGodMode: { type: Date, default: null },
    godModePermanent: { type: Boolean, default: false }
});

// Add middleware to check godmode expiration
userSchema.pre('save', function(next) {
    if (this.godModeActive && this.godModeExpires && Date.now() > this.godModeExpires) {
        this.godModeActive = false;
        this.godModeExpires = null;
    }
    next();
});

export const User = mongoose.model('User', userSchema);
