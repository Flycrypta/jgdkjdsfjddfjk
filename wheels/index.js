const WHEEL_ITEMS = [
    { id: 1, name: 'Common Box', rarity: 'common', value: 100 },
    { id: 2, name: 'Rare Box', rarity: 'rare', value: 250 },
    { id: 3, name: 'Epic Box', rarity: 'epic', value: 500 },
    { id: 4, name: 'Legendary Box', rarity: 'legendary', value: 1000 },
    { id: 5, name: 'Mythic Box', rarity: 'mythic', value: 2000 },
    // Add more items as needed
];

const WHEEL_TYPES = {
    COMMON: {
        cost: 50,
        minReward: 25,
        maxReward: 100,
        gemChance: 0.01
    },
    RARE: {
        cost: 100,
        minReward: 50,
        maxReward: 200,
        gemChance: 0.05
    },
    EPIC: {
        cost: 250,
        minReward: 125,
        maxReward: 500,
        gemChance: 0.10
    },
    LEGENDARY: {
        cost: 500,
        minReward: 250,
        maxReward: 1000,
        gemChance: 0.25
    },
    DIAMOND: {
        cost: 2000,
        minReward: 1000,
        maxReward: 4000,
        gemChance: 0.20,
        itemPool: WHEEL_ITEMS.filter(item => ['epic', 'legendary', 'mythic'].includes(item.rarity))
    }
};

// Update CAR_MODS with specific brand compatibility
const CAR_MODS = {
    Engine: {
        Turbocharger: [
            { id: 1, brand: 'Garrett', type: 'performance', value: 3000, hpGain: 70, compatibility: ['all'] },
            { id: 2, brand: 'HKS', type: 'performance', value: 3500, hpGain: 80, compatibility: ['Japanese'] },
            { id: 3, brand: 'Borgwarner', type: 'performance', value: 4000, hpGain: 90, compatibility: ['all'] }
        ],
        Supercharger: [
            { id: 4, brand: 'Vortech', type: 'performance', value: 4500, hpGain: 100, compatibility: ['American'] },
            { id: 5, brand: 'Rotrex', type: 'performance', value: 5000, hpGain: 110, compatibility: ['European'] },
            { id: 6, brand: 'Whipple', type: 'performance', value: 5500, hpGain: 120, compatibility: ['American'] }
        ]
    },
    Exhaust: {
        Headers: [
            { id: 7, brand: 'Borla', type: 'performance', value: 1000, hpGain: 15, compatibility: ['all'] },
            { id: 8, brand: 'Akrapovic', type: 'performance', value: 1500, hpGain: 20, compatibility: ['European'] }
        ],
        Catback: [
            { id: 9, brand: 'Magnaflow', type: 'performance', value: 800, hpGain: 10, compatibility: ['all'] },
            { id: 10, brand: 'Remus', type: 'performance', value: 1200, hpGain: 12, compatibility: ['European'] }
        ]
    },
    Suspension: {
        Coilovers: [
            { id: 11, brand: 'KW', type: 'handling', value: 2000, handling: 30, compatibility: ['all'] },
            { id: 12, brand: 'Ohlins', type: 'handling', value: 2500, handling: 35, compatibility: ['European'] }
        ],
        Springs: [
            { id: 13, brand: 'Eibach', type: 'handling', value: 500, handling: 15, compatibility: ['all'] },
            { id: 14, brand: 'H&R', type: 'handling', value: 600, handling: 18, compatibility: ['European'] }
        ]
    }
};

const CARS = [
    {
        id: 1,
        name: 'Toyota Camry',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        base_hp: 203,
        value: 25000,
        compatibility: ['TRD', 'Denso', 'NGK', 'Aisin'],
        mods: CAR_MODS
    },
    {
        id: 2,
        name: 'Honda Civic',
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        base_hp: 158,
        value: 22000,
        compatibility: ['Spoon', 'Mugen', 'HKS', 'Skunk2'],
        mods: CAR_MODS
    },
    {
        id: 3,
        name: 'BMW M3',
        make: 'BMW',
        model: 'M3',
        year: 2023,
        base_hp: 473,
        value: 70000,
        compatibility: ['Dinan', 'AC Schnitzer', 'Alpina', 'Eisenmann'],
        mods: CAR_MODS
    },
    {
        id: 4,
        name: 'Ford Mustang',
        make: 'Ford',
        model: 'Mustang GT',
        year: 2023,
        base_hp: 450,
        value: 45000,
        compatibility: ['Roush', 'Shelby', 'Borla', 'Ford Performance'],
        mods: CAR_MODS
    },
    // Add remaining 21 cars with similar structure
    {
        id: 5,
        name: 'Mercedes AMG C63',
        make: 'Mercedes',
        model: 'AMG C63',
        year: 2023,
        base_hp: 503,
        value: 80000,
        compatibility: ['AMG', 'Brabus', 'Carlsson', 'Lorinser'],
        mods: CAR_MODS
    }
    // ... Add remaining 20 cars
];

module.exports = { WHEEL_ITEMS, WHEEL_TYPES, CAR_MODS, CARS };
