import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    name: { type: String, required: true },
    baseModel: { type: String, required: true },
    owner: { type: String, required: true },
    stats: {
        acceleration: { type: Number, required: true },
        topSpeed: { type: Number, required: true },
        handling: { type: Number, required: true },
        braking: { type: Number, required: true }
    },
    modifications: [{
        type: { type: String },
        name: { type: String },
        stats: {
            acceleration: { type: Number, default: 0 },
            topSpeed: { type: Number, default: 0 },
            handling: { type: Number, default: 0 },
            braking: { type: Number, default: 0 }
        },
        installed: { type: Date }
    }],
    value: { type: Number, required: true },
    condition: { type: Number, default: 100 },
    raceHistory: [{
        type: { type: String },
        result: { type: String },
        opponent: { type: String },
        date: { type: Date }
    }],
    insurance: {
        type: { type: String, enum: ['none', 'basic', 'premium'] },
        coverage: Number,
        expiryDate: Date
    },
    customization: {
        paint: {
            color: String,
            type: { type: String, enum: ['solid', 'metallic', 'matte'] }
        },
        decals: [{
            id: String,
            position: {
                x: Number,
                y: Number,
                rotation: Number
            }
        }],
        bodyKit: String
    },
    driverSkills: {
        handling: { type: Number, default: 1 },
        racing: { type: Number, default: 1 },
        drifting: { type: Number, default: 1 }
    },
    performanceTier: { type: String, enum: ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'X'] },
    reliability: { type: Number, default: 100 },
    engineHealth: { type: Number, default: 100 },
    transmission: {
        type: { type: String, enum: ['manual', 'automatic', 'sequential', 'dct'] },
        health: { type: Number, default: 100 }
    },
    tuning: {
        gearRatios: [Number],
        suspension: {
            frontHeight: Number,
            rearHeight: Number,
            damping: Number,
            stiffness: Number
        },
        alignment: {
            camber: Number,
            toe: Number
        }
    }
});

// Change export to ES module syntax
const Car = mongoose.model('Car', carSchema);
export default Car;
