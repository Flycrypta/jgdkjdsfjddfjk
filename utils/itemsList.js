import { generateVIN } from './helpers.js';

export const allItems = [
    // MECHANIC TOOLS (IDs 1-50)
    {
        id: 1,
        name: "Basic Wrench Set",
        price: 100,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "common",
        stats: { efficiency: 5 }
    },
    {
        id: 2,
        name: "Professional Diagnostic Scanner",
        price: 2500,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "rare",
        stats: { efficiency: 15, diagnostic: 20 }
    },
    {
        id: 3,
        name: "Hydraulic Lift",
        price: 5000,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "epic",
        stats: { efficiency: 25, safety: 30 }
    },
    {
        id: 4,
        name: "Engine Analyzer",
        price: 3500,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "rare",
        stats: { diagnostic: 25, efficiency: 10 }
    },
    {
        id: 5,
        name: "Master Socket Set",
        price: 1200,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "common",
        stats: { efficiency: 12, durability: 15 }
    },
    {
        id: 6,
        name: "Pneumatic Impact Wrench",
        price: 2800,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "rare",
        stats: { efficiency: 20, speed: 15 }
    },
    {
        id: 7,
        name: "Laser Alignment System",
        price: 4500,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "epic",
        stats: { accuracy: 30, efficiency: 15 }
    },
    {
        id: 8,
        name: "Digital Torque Wrench",
        price: 1800,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "rare",
        stats: { accuracy: 20, reliability: 15 }
    },
    {
        id: 9,
        name: "Tire Mounting Machine",
        price: 3500,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "rare",
        stats: { efficiency: 25, speed: 20 }
    },
    {
        id: 10,
        name: "Wheel Balancer",
        price: 4000,
        type: "tool",
        jobRequired: "mechanic",
        rarity: "rare",
        stats: { accuracy: 30, quality: 25 }
    },
    {
        id: 51,
        name: "Premium Paint Gun",
        price: 1200,
        type: "tool",
        jobRequired: "painter",
        rarity: "rare",
        stats: { quality: 15, speed: 10 }
    },
    {
        id: 52,
        name: "Clear Coat Sprayer",
        price: 2000,
        type: "tool",
        jobRequired: "painter",
        rarity: "rare",
        stats: { quality: 20, finishing: 15 }
    },
    {
        id: 56,
        name: "Auto Paint Mixer",
        price: 3500,
        type: "tool",
        jobRequired: "painter",
        rarity: "epic",
        stats: { quality: 25, efficiency: 20 }
    },
    {
        id: 57,
        name: "UV Curing Lamp",
        price: 2200,
        type: "tool",
        jobRequired: "painter",
        rarity: "rare",
        stats: { speed: 20, quality: 10 }
    },
    {
        id: 101,
        name: "Turbocharger Kit",
        price: 15000,
        type: "part",
        rarity: "epic",
        stats: { horsepower: 100, acceleration: 20 }
    },
    {
        id: 102,
        name: "Racing ECU",
        price: 12000,
        type: "part",
        rarity: "epic",
        stats: { horsepower: 75, tuning: 25 }
    },
    {
        id: 106,
        name: "Forged Pistons",
        price: 8000,
        type: "part",
        rarity: "epic",
        stats: { horsepower: 40, reliability: 25 }
    },
    {
        id: 107,
        name: "Carbon Fiber Driveshaft",
        price: 6500,
        type: "part",
        rarity: "epic",
        stats: { acceleration: 15, weight: -30 }
    },
    {
        id: 108,
        name: "Racing Camshaft",
        price: 7500,
        type: "part",
        rarity: "epic",
        stats: { horsepower: 35, torque: 25 }
    },
    {
        id: 201,
        name: "Carbon Fiber Hood",
        price: 8000,
        type: "bodypart",
        rarity: "rare",
        stats: { weight: -50, aesthetics: 15 }
    },
    {
        id: 202,
        name: "Wide Body Kit",
        price: 15000,
        type: "bodypart",
        rarity: "epic",
        stats: { handling: 30, aesthetics: 40 }
    },
    {
        id: 206,
        name: "Titanium Exhaust System",
        price: 12000,
        type: "bodypart",
        rarity: "epic",
        stats: { weight: -40, horsepower: 15, sound: 30 }
    },
    {
        id: 207,
        name: "Active Aero Wing",
        price: 18000,
        type: "bodypart",
        rarity: "legendary",
        stats: { handling: 40, downforce: 50 }
    },
    {
        id: 451,
        name: "Golden Wrench",
        price: 50000,
        type: "special",
        rarity: "legendary",
        stats: {
            efficiency: 50,
            luck: 25,
            prestige: 100
        }
    },
    {
        id: 452,
        name: "Legendary Toolbox",
        price: 100000,
        type: "special",
        rarity: "legendary",
        stats: {
            efficiency: 100,
            luck: 50,
            prestige: 200
        }
    },
    {
        id: 456,
        name: "Quantum Tuning Device",
        price: 250000,
        type: "special",
        rarity: "legendary",
        stats: {
            tuning: 100,
            innovation: 50,
            prestige: 300
        }
    },
    {
        id: 457,
        name: "Master Craftsman's Seal",
        price: 150000,
        type: "special",
        rarity: "legendary",
        stats: {
            quality: 75,
            reputation: 100,
            crafting: 50
        }
    },
    {
        id: 501,
        name: "Basic Car Polish",
        price: 50,
        type: "consumable",
        rarity: "common",
        stats: { aesthetics: 5 },
        uses: 3,
        cooldown: 3600    },
    {
        id: 502,
        name: "Tire Pressure Gauge",
        price: 25,
        type: "consumable",
        rarity: "common",
        stats: { safety: 3 },
        uses: 10,
        cooldown: 1800
    },
    {
        id: 503,
        name: "Quick Wax",
        price: 75,
        type: "consumable",
        rarity: "common",
        stats: { aesthetics: 8 },
        uses: 5,
        cooldown: 7200
    },
    {
        id: 504,
        name: "Window Cleaner Pro",
        price: 30,
        type: "consumable",
        rarity: "common",
        stats: { visibility: 10 },
        uses: 8,
        cooldown: 3600
    },
    {
        id: 505,
        name: "Engine Oil Top-up",
        price: 100,
        type: "consumable",
        rarity: "common",
        stats: { reliability: 5 },
        uses: 1,
        cooldown: 86400    },
    {
        id: 506,
        name: "Brake Cleaner Spray",
        price: 45,
        type: "consumable",
        rarity: "common",
        stats: { braking: 8 },
        uses: 4,
        cooldown: 7200
    },
    {
        id: 507,
        name: "Scratch Repair Pen",
        price: 65,
        type: "consumable",
        rarity: "common",
        stats: { aesthetics: 3 },
        uses: 15,
        cooldown: 1800
    },
    {
        id: 508,
        name: "Leather Conditioner",
        price: 85,
        type: "consumable",
        rarity: "common",
        stats: { comfort: 10, aesthetics: 5 },
        uses: 6,
        cooldown: 43200    },
    {
        id: 509,
        name: "Tire Shine Spray",
        price: 40,
        type: "consumable",
        rarity: "common",
        stats: { aesthetics: 6 },
        uses: 8,
        cooldown: 3600
    },
    {
        id: 510,
        name: "Premium Fuel Additive",
        price: 150,
        type: "consumable",
        rarity: "rare",
        stats: { performance: 15, efficiency: 10 },
        uses: 1,
        cooldown: 86400
    },
    {
        id: 511,
        name: "Emergency Repair Kit",
        price: 500,
        type: "consumable",
        rarity: "rare",
        stats: { reliability: 25 },
        uses: 1,
        cooldown: 604800    },
    {
        id: 512,
        name: "Ceramic Coating",
        price: 1000,
        type: "consumable",
        rarity: "epic",
        stats: { protection: 50, aesthetics: 25 },
        uses: 1,
        cooldown: 2592000    },
    {
        id: 513,
        name: "High-Performance Oil Filter",
        price: 120,
        type: "consumable",
        rarity: "rare",
        stats: { efficiency: 12, reliability: 8 },
        uses: 1,
        cooldown: 43200
    },
    {
        id: 514,
        name: "Microfiber Detail Kit",
        price: 95,
        type: "consumable",
        rarity: "common",
        stats: { aesthetics: 15, quality: 10 },
        uses: 10,
        cooldown: 3600
    },
    {
        id: 515,
        name: "Advanced Tire Sealant",
        price: 200,
        type: "consumable",
        rarity: "rare",
        stats: { reliability: 20, safety: 15 },
        uses: 3,
        cooldown: 14400
    },
    {
        id: 516,
        name: "Paint Protection Film",
        price: 750,
        type: "consumable",
        rarity: "epic",
        stats: { protection: 40, durability: 30 },
        uses: 1,
        cooldown: 1209600    },
    {
        id: 517,
        name: "Performance Air Filter",
        price: 180,
        type: "consumable",
        rarity: "rare",
        stats: { horsepower: 5, efficiency: 8 },
        uses: 1,
        cooldown: 172800    },
    {
        id: 301,
        name: "2023 Toyota Supra",
        price: 55000,
        type: "car",
        vin: generateVIN(),
        carfax: {
            purchaseDate: new Date().toISOString(),
            history: [],
            mileage: 0,
            owners: 0,
            accidents: 0,
            services: []
        },
        stats: { 
            horsepower: 382,
            topSpeed: 155,
            acceleration: 4.1,
            handling: 9.0
        }
    },
    {
        id: 308,
        name: "2023 Audi RS7",
        price: 125000,
        type: "car",
        vin: generateVIN(),
        carfax: {
            purchaseDate: new Date().toISOString(),
            history: [],
            mileage: 0,
            owners: 0,
            accidents: 0,
            services: []
        },
        rarity: "legendary",
        stats: {
            horsepower: 591,
            topSpeed: 190,
            acceleration: 3.5,
            handling: 9.3
        }
    },
    {
        id: 701,
        name: "Luxury Watch",
        price: 50000,
        type: "luxury",
        rarity: "legendary",
        stats: { prestige: 100, style: 50 }
    },
    {
        id: 702,
        name: "Designer Suit",
        price: 30000,
        type: "luxury",
        rarity: "epic",
        stats: { prestige: 75, style: 40 }
    },
];

export const CARS = [
    // Japanese Cars
    {
        id: 1,
        name: 'Toyota Supra MK4',
        make: 'Toyota',
        model: 'Supra',
        year: 1993,
        base_hp: 320,
        value: 80000,
        rarity: 'legendary',
        region: 'JAPANESE'
    },
    // ...add more cars
];

export const HOMES = [
    {
        id: 1,
        name: 'Small Apartment',
        price: 50000,
        security: 1,
        storage: 100000
    },
    // ...add more homes
];

const carfaxEventTypes = {
    PURCHASE: 'purchase',
    SERVICE: 'service',
    ACCIDENT: 'accident',
    MODIFICATION: 'modification',
    OWNERSHIP_CHANGE: 'ownership_change',
    MILEAGE_UPDATE: 'mileage_update'
};

// Helper function to add CarFax event
const addCarfaxEvent = (vin, event) => {
    const car = allItems.find(item => item.type === 'car' && item.vin === vin);
    if (car && car.carfax) {
        car.carfax.history.push({
            ...event,
            date: new Date().toISOString()
        });
    }
};

const categories = {
    TOOLS: {
        MECHANIC: { startId: 1, endId: 50 },
        PAINTER: { startId: 51, endId: 100 }
    },
    PARTS: {
        BODY: { startId: 201, endId: 300 }
    },
    VEHICLES: { startId: 301, endId: 400 },
    PROPERTIES: { startId: 401, endId: 450 },
    SPECIAL: { startId: 451, endId: 500 },
    DAILY_ITEMS: { startId: 501, endId: 700 },
    LUXURY_ITEMS: { startId: 701, endId: 750 }
};

const homes = {
    small: { 
        id: 401,
        name: "Small House",
        price: 50000, 
        security: 1, 
        storage: 100000,
        stats: {
            storage: 3,
            income: 1000,
            security: 2
        }
    },
    medium: { 
        id: 402,
        name: "Medium House",
        price: 150000, 
        security: 2, 
        storage: 300000,
        stats: {
            storage: 5,
            income: 2000,
            security: 3
        }
    },
    mansion: { 
        id: 403,
        name: "Mansion",
        price: 500000, 
        security: 3, 
        storage: 1000000,
        stats: {
            storage: 10,
            income: 5000,
            security: 5
        }
    }
};

// Helper functions
const getItemById = (id) => allItems.find(item => item.id === id);
const getItemsByJob = (job) => allItems.filter(item => item.jobRequired === job);
const getItemsByRarity = (rarity) => allItems.filter(item => item.rarity === rarity);
const getItemsByType = (type) => allItems.filter(item => item.type === type);

// Add new helper functions
const getCategoryItems = (category) => {
    const range = categories[category];
    return allItems.filter(item => 
        item.id >= range.startId && 
        item.id <= range.endId
    );
};

const getItemValue = (item) => {
    const baseValue = item.price;
    const rarityMultipliers = {
        common: 1,
        rare: 1.5,
        epic: 2.5,
        legendary: 5
    };
    return Math.floor(baseValue * rarityMultipliers[item.rarity]);
};

// Add new helper for consumables
const getConsumableStats = (itemId, uses) => {
    const item = getItemById(itemId);
    return {
        ...item.stats,
        remainingUses: uses,
        cooldownEnds: Date.now() + (item.cooldown * 1000)
    };
};

// Convert all exports to ES module format
export {
    allItems,
    CARS,
    carfaxEventTypes,
    addCarfaxEvent,
    HOMES,
    categories,
    homes,
    getItemById,
    getItemsByJob,
    getItemsByRarity,
    getItemsByType,
    getCategoryItems,
    getItemValue,
    getConsumableStats
};
