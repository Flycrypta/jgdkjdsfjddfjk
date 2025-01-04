import { allItems, CARS, HOMES } from '../utils/itemsList.js';

// Add job definitions first to reference them in items
export const jobs = {
    MECHANIC: 'mechanic',
    CHEF: 'chef',
    SECURITY: 'security',
    OFFICE_WORKER: 'office_worker',
    REAL_ESTATE: 'real_estate',
    DRIVER: 'driver',
    FACTORY_WORKER: 'factory_worker',
    DEALER: 'car_dealer',
    ENGINEER: 'engineer'
};

// Define job categories first
export const jobCategories = {
    AUTOMOTIVE: {
        jobs: ['mechanic', 'car_dealer', 'auto_electrician', 'paint_specialist'],
        baseItems: [1, 2, 3, 4] // Basic tool IDs that all automotive jobs can use
    },
    HOSPITALITY: {
        jobs: ['chef', 'bartender', 'restaurant_manager', 'hotel_staff'],
        baseItems: [52, 56, 57, 58] // Basic hospitality equipment IDs
    },
    OFFICE: {
        jobs: ['accountant', 'manager', 'secretary', 'analyst'],
        baseItems: [51, 59, 60, 61] // Basic office equipment IDs
    },
    SECURITY: {
        jobs: ['guard', 'surveillance', 'bouncer', 'patrol'],
        baseItems: [53, 62, 63, 64] // Basic security equipment IDs
    },
    INDUSTRIAL: {
        jobs: ['factory_worker', 'warehouse_manager', 'forklift_operator'],
        baseItems: [54, 65, 66, 67] // Basic industrial equipment IDs
    }
};

// Use imported items
export const items = allItems;
export const cars = CARS;
export const homes = HOMES;

export const creditCards = {
    bronze: { id: 2, limit: 1000, interestRate: 0.25, requirements: { level: 1, income: 1000 } },
    silver: { id: 25, limit: 5000, interestRate: 0.20, requirements: { level: 10, income: 5000 } },
    gold: { id: 40, limit: 25000, interestRate: 0.15, requirements: { level: 25, income: 25000 } },
    platinum: { id: 49, limit: 100000, interestRate: 0.10, requirements: { level: 50, income: 100000 } }
};

export const carEmojis = {
    sedan: "🚗",
    sports: "🏎️",
    suv: "🚙",
    truck: "🚛",
    luxury: "🚘"
};

// Modify existing cars array
export const carModsByModel = {
    "Toyota Corolla": [
        {
            id: 1,
            name: "Corolla Sport Tune",
            price: 2000,
            stats: { hpGain: 15, torqueGain: 10 }
        },
        {
            id: 2,
            name: "Corolla ECU Upgrade",
            price: 1500,
            stats: { hpGain: 10, torqueGain: 8 }
        }
        // ...more Corolla-specific mods
    ],
    "Honda Civic Type R": [
        {
            id: 1,
            name: "Type R Power Pack",
            price: 4000,
            stats: { hpGain: 25, torqueGain: 20 }
        },
        {
            id: 2,
            name: "Type R Race ECU",
            price: 3000,
            stats: { hpGain: 20, torqueGain: 15 }
        }
        // ...more Type R-specific mods
    ]
    // ...continuing for each car model
};

// New Car Mods Categories Structure
export const carModCategories = {
    ENGINE: {
        basic: [
            { id: 101, name: "Air Intake System", price: 500, rarity: "common", effect: { hp: 5, torque: 3 } },
            { id: 102, name: "Performance Spark Plugs", price: 200, rarity: "common", effect: { hp: 2, reliability: 5 } }
        ],
        advanced: [
            { id: 103, name: "Turbocharger Kit", price: 5000, rarity: "rare", effect: { hp: 50, torque: 40 } },
            { id: 104, name: "Engine Management System", price: 3000, rarity: "rare", effect: { hp: 25, efficiency: 10 } }
        ],
        premium: [
            { id: 105, name: "Racing Engine Block", price: 15000, rarity: "epic", effect: { hp: 100, reliability: 20 } },
            { id: 106, name: "VIP Twin Turbo System", price: 25000, rarity: "legendary", effect: { hp: 150, torque: 100 } }
        ]
    },
    SUSPENSION: {
        basic: [
            { id: 201, name: "Lowering Springs", price: 800, rarity: "common", effect: { handling: 10 } }
        ],
        advanced: [
            { id: 202, name: "Coilover Kit", price: 2500, rarity: "rare", effect: { handling: 25, comfort: -5 } }
        ],
        premium: [
            { id: 203, name: "VIP Adaptive Suspension", price: 12000, rarity: "legendary", effect: { handling: 40, comfort: 10 } }
        ]
    },
    // Add more categories...
};

export const carServices = [
    {
        id: 1,
        name: "Basic Service",
        cost: 1000,
        duration: 2,
        effect: { reliability: 10, performance: 5 }
    },
    {
        id: 2,
        name: "Premium Service",
        cost: 2500,
        duration: 4,
        effect: { reliability: 25, performance: 15 }
    },
    {
        id: 3,
        name: "Full Restoration",
        cost: 5000,
        duration: 8,
        effect: { reliability: 50, performance: 30 }
    }
];

export const carMods = [
    {
        id: 1,
        name: "Turbocharger",
        cost: 5000,
        effect: { speed: 30, workBonus: 10 },
        requirements: { level: 5 }
    },
    {
        id: 2,
        name: "Sports Suspension",
        cost: 3000,
        effect: { handling: 20, speed: 10 },
        requirements: { level: 3 }
    },
    {
        id: 3,
        name: "Engine Tune",
        cost: 2000,
        effect: { speed: 15, reliability: -5 },
        requirements: { level: 2 }
    }
];

export const carModPreviews = {
    "Turbocharger Kit": {
        before: "https://i.imgur.com/stock_engine.png",
        after: "https://i.imgur.com/turbo_engine.png"
    },
    // ... more mod previews
};

export const specialPowers = {
    godMode: {
        duration: 300000, // 5 minutes in milliseconds
        effects: {
            immortality: true,
            unlimitedMoney: true,
            maxStats: true,
            cooldown: 86400000 // 24 hours in milliseconds
        },
        requirements: {
            level: 50,
            achievement: "Master Mechanic"
        }
    }
};

export const marketConfig = {
    refreshInterval: 3600000, // 1 hour in milliseconds
    priceVolatility: 0.15,   // 15% maximum price swing
    itemLimits: {
        common: 50,
        rare: 10,
        legendary: 1
    },
    tradingFees: {
        standard: 0.05,    // 5% fee
        premium: 0.025,    // 2.5% fee
        vip: 0.01         // 1% fee
    }
};

export const commandCooldowns = {
    godmode: 86400000, // 24 hours
    trade: 300000,     // 5 minutes
    race: 1800000,     // 30 minutes
    repair: 600000     // 10 minutes
};

export const commandRequirements = {
    godmode: {
        minLevel: 50,
        achievements: ["Master Mechanic"],
        money: 1000000
    }
    // ...add other command requirements
};

// Add job unlockables tracking
export const jobUnlockables = {
    [jobs.MECHANIC]: {
        items: [1, 2, 3, 4, 5], // IDs of items unlocked by having this job
        specialAccess: ['repair_shop', 'tool_discount'],
        requiredLevel: 1
    },
    [jobs.CHEF]: {
        items: [52],
        specialAccess: ['restaurant_kitchen'],
        requiredLevel: 1
    },
    // ... continue for other jobs
};

// VIP Drop Tables
export const vipDropTables = {
    standard: {
        rarityWeights: { common: 70, rare: 25, epic: 4.9, legendary: 0.1 },
        guaranteedMods: 0
    },
    premium: {
        rarityWeights: { common: 40, rare: 40, epic: 15, legendary: 5 },
        guaranteedMods: 1
    },
    vip: {
        rarityWeights: { common: 0, rare: 50, epic: 35, legendary: 15 },
        guaranteedMods: 2
    }
};

// Update wheel configurations to exclude job-locked items
export const wheelConfig = {
    excludeJobItems: true,
    modDropRates: {
        common: 0.1,
        rare: 0.05,
        epic: 0.01,
        legendary: 0.001
    },
    vipModDropRates: {
        rare: 0.15,
        epic: 0.05,
        legendary: 0.01
    }
};
