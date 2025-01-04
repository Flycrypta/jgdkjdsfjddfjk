// Item Schema Definition
const itemSchema = {
  id: Number,
  name: String, 
  price: Number,
  type: ['tool', 'part', 'safety', 'modification', 'service'],
  tradeable: Boolean,
  durability: Number,
  weight: Number,
  slot: String,
  rarity: ['common', 'uncommon', 'rare', 'legendary'],
  description: String,
  imageUrl: String,
  jobRequired: String,
  quantity: Number
};

// Validation function
const validateItem = (item) => {
    try {
        const requiredFields = ['id', 'name', 'price', 'type'];
        const errors = [];

        requiredFields.forEach(field => {
            if (!item[field]) errors.push(`Missing required field: ${field}`);
        });

        if (item.imageUrl && !validateImageUrl(item.imageUrl)) {
            errors.push('Invalid image URL format');
        }

        return { valid: errors.length === 0, errors };
    } catch (error) {
        console.error('Error validating item:', error);
        return { valid: false, errors: [error.message] };
    }
};

// Image URL validation
const validateImageUrl = (url) => {
  return url.startsWith('https://') && url.match(/\.(jpg|jpeg|png|gif)$/i);
};

// Local asset mapping
const assetMap = {
  tools: '/assets/items/tools/',
  parts: '/assets/items/parts/',
  vehicles: '/assets/vehicles/',
  homes: '/assets/properties/',
  services: '/assets/services/'
};

export const dailyItems = [
  // Tools & Equipment (1-100)
  {
    id: 1,
    name: "Multi-Tool Set",
    price: 45,
    type: "tool",
    tradeable: true, 
    durability: 100,
    weight: 1,
    slot: "tool",
    rarity: "common",
    description: "All-in-one pocket tool",
    imageUrl: `${assetMap.tools}multitool.png`
  },
  {
    id: 2,
    name: "Advanced Diagnostic Kit",
    price: 750,
    type: "tool",
    tradeable: true,
    durability: 200,
    weight: 3,
    slot: "diagnostic",
    rarity: "rare",
    description: "Professional diagnostics suite",
    imageUrl: `${assetMap.tools}diagnostic_kit.png`
  },
  {
    id: 3,
    name: "Performance Tuning Chip",
    price: 1200,
    type: "modification",
    tradeable: true,
    durability: 500,
    weight: 0.2,
    slot: "electronics",
    rarity: "legendary",
    description: "Advanced ECU modification chip",
    imageUrl: `${assetMap.parts}tuning_chip.png`
  }
  // ... 100 more daily items
];

export const jobItems = {
  MECHANIC: [
    {
      id: 101,
      name: "Professional Diagnostic Scanner",
      price: 3500,
      type: "tool",
      jobRequired: "mechanic",
      durability: 500,
      weight: 5,
      slot: "diagnostic",
      rarity: "rare", 
      description: "Advanced vehicle diagnostic tool",
      imageUrl: `${assetMap.tools}scanner.png`
    },
    {
      id: 102,
      name: "Hydraulic Lift System",
      price: 5000,
      type: "tool",
      jobRequired: "mechanic",
      durability: 1000,
      weight: 500,
      slot: "workshop",
      rarity: "legendary",
      description: "Professional vehicle lift",
      imageUrl: `${assetMap.tools}hydraulic_lift.png`
    }
    // ... 50 mechanic items
  ],
  
  ELECTRICIAN: [
    {
      id: 201, 
      name: "Industrial Multimeter",
      price: 450,
      type: "tool",
      jobRequired: "electrician",
      durability: 200,
      weight: 2,
      slot: "diagnostic",
      rarity: "uncommon",
      description: "Professional grade multimeter",
      imageUrl: `${assetMap.tools}multimeter.png`
    },
    // ... 50 electrician items
  ],
  
  PAINTER: [
    {
      id: 301,
      name: "Professional Paint Booth",
      price: 7500,
      type: "tool",
      jobRequired: "painter",
      durability: 1000,
      weight: 1000,
      slot: "workshop",
      rarity: "legendary",
      description: "Vehicle painting station",
      imageUrl: `${assetMap.tools}paint_booth.png`
    }
  ]
  // Other job categories...
};

export const vehicles = [
  // Electric Vehicles
  {
    id: 1,
    name: "2023 Tesla Model 3",
    price: 45000,
    type: "electric",
    seats: 5,
    trunk: 15,
    performance: {
      acceleration: 5.8,
      topSpeed: 140,
      handling: 8.5
    },
    imageUrl: `${assetMap.vehicles}tesla_model3.png`
  },
  {
    id: 2,
    name: "2023 Porsche Taycan",
    price: 85000,
    type: "electric",
    seats: 4,
    trunk: 12,
    performance: {
      acceleration: 3.8,
      topSpeed: 155,
      handling: 9.5
    },
    imageUrl: `${assetMap.vehicles}taycan.png`
  },
  // Sports Cars
  {
    id: 3,
    name: "2023 Toyota Supra",
    price: 55000,
    type: "sports",
    seats: 2,
    trunk: 8,
    performance: {
      acceleration: 4.1,
      topSpeed: 160,
      handling: 9.0
    },
    imageUrl: `${assetMap.vehicles}supra.png`
  },
  // Luxury Sedans
  {
    id: 4,
    name: "2023 Mercedes S-Class",
    price: 95000,
    type: "luxury",
    seats: 5,
    trunk: 18,
    performance: {
      acceleration: 4.9,
      topSpeed: 155,
      handling: 8.0
    },
    imageUrl: `${assetMap.vehicles}sclass.png`
  },
  // SUVs
  {
    id: 5,
    name: "2023 Range Rover Sport",
    price: 75000,
    type: "suv",
    seats: 7,
    trunk: 25,
    performance: {
      acceleration: 5.9,
      topSpeed: 140,
      handling: 7.5
    },
    imageUrl: `${assetMap.vehicles}range_rover.png`
  },
  // Hypercars
  {
    id: 6,
    name: "2023 McLaren 720S",
    price: 310000,
    type: "supercar",
    seats: 2,
    trunk: 5,
    performance: {
      acceleration: 2.8,
      topSpeed: 212,
      handling: 9.8
    },
    imageUrl: `${assetMap.vehicles}mclaren_720s.png`
  },
  // Muscle Cars
  {
    id: 7,
    name: "2023 Dodge Challenger Hellcat",
    price: 65000,
    type: "muscle",
    seats: 4,
    trunk: 16,
    performance: {
      acceleration: 3.6,
      topSpeed: 199,
      handling: 8.0
    },
    imageUrl: `${assetMap.vehicles}challenger_hellcat.png`
  }
  // ... 50 vehicles
];

export const properties = [
  {
    id: 1,
    name: "Downtown Apartment",
    price: 250000,
    type: "apartment",
    rooms: 2,
    garage: 1,
    location: {
      x: 125,
      y: 240
    },
    imageUrl: `${assetMap.homes}downtown_apt.png`
  },
  // ... 10 properties
];

export const carModifications = [
  {
    id: 1,
    name: "Sport Suspension Kit",
    price: 2500,
    type: "modification",
    compatibility: ["sports", "muscle"],
    performance: {
      handling: +1.5,
      acceleration: +0.3
    },
    imageUrl: `${assetMap.parts}suspension.png`
  },
  {
    id: 2,
    name: "Racing ECU",
    price: 3500,
    type: "modification",
    compatibility: ["sports", "super"],
    performance: {
      horsepower: +25,
      torque: +20,
      acceleration: -0.5
    },
    imageUrl: `${assetMap.parts}racing_ecu.png`
  },
  {
    id: 3,
    name: "Carbon Fiber Hood",
    price: 2000,
    type: "modification",
    compatibility: ["sports", "muscle", "super"],
    performance: {
      weight: -25,
      acceleration: -0.2
    },
    imageUrl: `${assetMap.parts}carbon_hood.png`
  }
  // ... 50 modifications
];

// Add special event items
export const eventItems = {
  CHRISTMAS: [
    {
      id: 1001,
      name: "Festive Car Wrap",
      price: 2500,
      type: "modification",
      tradeable: true,
      durability: 100,
      weight: 2,
      slot: "cosmetic",
      rarity: "legendary",
      description: "Limited edition holiday design",
      imageUrl: `${assetMap.parts}festive_wrap.png`
    }
  ],
  HALLOWEEN: [
    {
      id: 1101,
      name: "Spooky Neon Kit",
      price: 1500,
      type: "modification",
      tradeable: true,
      durability: 200,
      weight: 3,
      slot: "cosmetic",
      rarity: "rare",
      description: "Haunted underglow effect",
      imageUrl: `${assetMap.parts}halloween_neon.png`
    }
  ]
};

// Add service packages
export const servicePackages = [
  {
    id: 1,
    name: "Basic Tune-Up",
    price: 500,
    type: "service",
    duration: 30,
    benefits: {
      reliability: +10,
      performance: +5
    },
    description: "Standard maintenance service",
    imageUrl: `${assetMap.services}tune_up.png`
  },
  {
    id: 2,
    name: "Performance Package",
    price: 2500,
    type: "service",
    duration: 120,
    benefits: {
      reliability: +15,
      performance: +20,
      handling: +10
    },
    description: "Complete performance optimization",
    imageUrl: `${assetMap.services}performance.png`
  }
];