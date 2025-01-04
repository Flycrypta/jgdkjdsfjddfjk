// Example of a file providing 25 item objects

// Add weapon items with stats and images
const weapons = [
    { 
        id: 101, 
        name: 'Iron Sword',
        type: 'weapon',
        damage: 15,
        durability: 100,
        price: 1000,
        rarity: 'common',
        image: 'https://i.imgur.com/swordIcon1.png',
        stats: { strength: 5, defense: 2 }
    },
    { 
        id: 102, 
        name: 'Steel Blade',
        type: 'weapon',
        damage: 25,
        durability: 150,
        price: 2500,
        rarity: 'uncommon',
        image: 'https://i.imgur.com/swordIcon2.png',
        stats: { strength: 8, defense: 3 }
    },
    { 
        id: 103, 
        name: 'Mythril Katana',
        type: 'weapon',
        damage: 45,
        durability: 200,
        price: 5000,
        rarity: 'rare',
        image: 'https://i.imgur.com/katanaIcon.png',
        stats: { strength: 15, speed: 5 }
    }
];

export const allItems = [
    ...weapons,
    { id: 1, name: 'Basic Loot Box', type: 'container', price: 500, rarity: 'common', image: 'basic_loot_box.png' },
    { id: 2, name: 'Rare Loot Box', type: 'container', price: 1000, rarity: 'rare', image: 'rare_loot_box.png' },
    { id: 3, name: 'Epic Loot Box', type: 'container', price: 2000, rarity: 'epic', image: 'epic_loot_box.png' },
    { id: 4, name: 'Legendary Loot Box', type: 'container', price: 5000, rarity: 'legendary', image: 'legendary_loot_box.png' },
    { id: 5, name: 'Mythic Loot Box', type: 'container', price: 10000, rarity: 'mythic', image: 'mythic_loot_box.png' },
    { id: 6, name: 'Common Potion', type: 'consumable', price: 100, rarity: 'common', image: 'common_potion.png' },
    { id: 7, name: 'Uncommon Potion', type: 'consumable', price: 250, rarity: 'uncommon', image: 'uncommon_potion.png' },
    { id: 8, name: 'Rare Potion', type: 'consumable', price: 500, rarity: 'rare', image: 'rare_potion.png' },
    { id: 9, name: 'Epic Potion', type: 'consumable', price: 1000, rarity: 'epic', image: 'epic_potion.png' },
    { id: 10, name: 'Legendary Potion', type: 'consumable', price: 2500, rarity: 'legendary', image: 'legendary_potion.png' },
    { id: 11, name: 'Mythic Potion', type: 'consumable', price: 5000, rarity: 'mythic', image: 'mythic_potion.png' },
    { id: 12, name: 'Common Sword', type: 'weapon', price: 500, rarity: 'common', image: 'common_sword.png' },
    { id: 13, name: 'Uncommon Sword', type: 'weapon', price: 1000, rarity: 'uncommon', image: 'uncommon_sword.png' },
    { id: 14, name: 'Rare Sword', type: 'weapon', price: 2000, rarity: 'rare', image: 'rare_sword.png' },
    { id: 15, name: 'Epic Sword', type: 'weapon', price: 5000, rarity: 'epic', image: 'epic_sword.png' },
    { id: 16, name: 'Legendary Sword', type: 'weapon', price: 10000, rarity: 'legendary', image: 'legendary_sword.png' },
    { id: 17, name: 'Mythic Sword', type: 'weapon', price: 20000, rarity: 'mythic', image: 'mythic_sword.png' },
    { id: 18, name: 'Common Shield', type: 'armor', price: 500, rarity: 'common', image: 'common_shield.png' },
    { id: 19, name: 'Uncommon Shield', type: 'armor', price: 1000, rarity: 'uncommon', image: 'uncommon_shield.png' },
    { id: 20, name: 'Rare Shield', type: 'armor', price: 2000, rarity: 'rare', image: 'rare_shield.png' },
    { id: 21, name: 'Epic Shield', type: 'armor', price: 5000, rarity: 'epic', image: 'epic_shield.png' },
    { id: 22, name: 'Legendary Shield', type: 'armor', price: 10000, rarity: 'legendary', image: 'legendary_shield.png' },
    { id: 23, name: 'Mythic Shield', type: 'armor', price: 20000, rarity: 'mythic', image: 'mythic_shield.png' },
    { id: 24, name: 'Common Ring', type: 'accessory', price: 250, rarity: 'common', image: 'common_ring.png' },
    { id: 25, name: 'Uncommon Ring', type: 'accessory', price: 500, rarity: 'uncommon', image: 'uncommon_ring.png' },
    { id: 32, brand: 'Toyota', model: 'Corolla', type: 'car', price: 5000, rarity: 'common', hp: 100, weight: 1500, vin: generateVin(), image: 'toyota_corolla.png' },
    { id: 33, brand: 'Honda', model: 'Civic', type: 'car', price: 10000, rarity: 'uncommon', hp: 150, weight: 1400, vin: generateVin(), image: 'honda_civic.png' },
    { id: 34, brand: 'Ford', model: 'Mustang', type: 'car', price: 25000, rarity: 'rare', hp: 200, weight: 1300, vin: generateVin(), image: 'ford_mustang.png' },
    { id: 35, brand: 'Chevrolet', model: 'Camaro', type: 'car', price: 50000, rarity: 'epic', hp: 300, weight: 1200, vin: generateVin(), image: 'chevrolet_camaro.png' },
    { id: 36, brand: 'Tesla', model: 'Model S', type: 'car', price: 100000, rarity: 'legendary', hp: 400, weight: 1100, vin: generateVin(), image: 'tesla_model_s.png' },
    { id: 37, brand: 'Ferrari', model: '488', type: 'car', price: 250000, rarity: 'mythic', hp: 500, weight: 1000, vin: generateVin(), image: 'ferrari_488.png' },
    { id: 38, name: 'Coins', type: 'currency', price: 1, rarity: 'common', image: 'coins.png' },
    { id: 26, name: 'Small Apartment', type: 'home', price: 10000, size: 'small', rarity: 'common', image: 'small_apartment.png' },
    { id: 27, name: 'Medium Apartment', type: 'home', price: 20000, size: 'medium', rarity: 'uncommon', image: 'medium_apartment.png' },
    { id: 28, name: 'Large Apartment', type: 'home', price: 50000, size: 'large', rarity: 'rare', image: 'large_apartment.png' },
    { id: 29, name: 'Small House', type: 'home', price: 100000, size: 'small', rarity: 'epic', image: 'small_house.png' },
    { id: 30, name: 'Medium House', type: 'home', price: 200000, size: 'medium', rarity: 'legendary', image: 'medium_house.png' },
    { id: 31, name: 'Large House', type: 'home', price: 500000, size: 'large', rarity: 'mythic', image: 'large_house.png' },

    // Additional Cars
    { id: 39, brand: 'BMW', model: 'M3', type: 'car', price: 85000, rarity: 'epic', hp: 425, weight: 1200, vin: generateVin(), image: 'bmw_m3.png' },
    { id: 40, brand: 'Mercedes', model: 'AMG GT', type: 'car', price: 150000, rarity: 'legendary', hp: 550, weight: 1100, vin: generateVin(), image: 'mercedes_amg.png' },
    { id: 41, brand: 'Audi', model: 'R8', type: 'car', price: 200000, rarity: 'legendary', hp: 570, weight: 1050, vin: generateVin(), image: 'audi_r8.png' },
    { id: 42, brand: 'Porsche', model: '911', type: 'car', price: 180000, rarity: 'legendary', hp: 540, weight: 1100, vin: generateVin(), image: 'porsche_911.png' },
    { id: 43, brand: 'Lamborghini', model: 'Huracan', type: 'car', price: 300000, rarity: 'mythic', hp: 610, weight: 950, vin: generateVin(), image: 'lambo_huracan.png' },
    { id: 44, brand: 'McLaren', model: '720S', type: 'car', price: 350000, rarity: 'mythic', hp: 720, weight: 900, vin: generateVin(), image: 'mclaren_720s.png' },
    { id: 45, brand: 'Nissan', model: 'GTR', type: 'car', price: 120000, rarity: 'epic', hp: 565, weight: 1250, vin: generateVin(), image: 'nissan_gtr.png' },
    { id: 46, brand: 'Subaru', model: 'WRX STI', type: 'car', price: 40000, rarity: 'rare', hp: 310, weight: 1350, vin: generateVin(), image: 'subaru_wrx.png' },
    { id: 47, brand: 'Volkswagen', model: 'Golf R', type: 'car', price: 45000, rarity: 'rare', hp: 315, weight: 1300, vin: generateVin(), image: 'vw_golf_r.png' },
    { id: 48, brand: 'Dodge', model: 'Challenger', type: 'car', price: 75000, rarity: 'epic', hp: 485, weight: 1400, vin: generateVin(), image: 'dodge_challenger.png' },
    { id: 49, brand: 'Lexus', model: 'LC500', type: 'car', price: 95000, rarity: 'epic', hp: 471, weight: 1250, vin: generateVin(), image: 'lexus_lc500.png' },
    { id: 50, brand: 'Maserati', model: 'MC20', type: 'car', price: 250000, rarity: 'mythic', hp: 621, weight: 1000, vin: generateVin(), image: 'maserati_mc20.png' },
    { id: 51, brand: 'Aston Martin', model: 'Vantage', type: 'car', price: 180000, rarity: 'legendary', hp: 503, weight: 1150, vin: generateVin(), image: 'aston_vantage.png' },
    { id: 52, brand: 'Jaguar', model: 'F-Type R', type: 'car', price: 120000, rarity: 'epic', hp: 575, weight: 1200, vin: generateVin(), image: 'jaguar_ftype.png' },
    { id: 53, brand: 'Alfa Romeo', model: 'Giulia', type: 'car', price: 80000, rarity: 'epic', hp: 505, weight: 1250, vin: generateVin(), image: 'alfa_giulia.png' },

    // Daily Life Items
    { id: 54, name: 'Smartphone', type: 'electronics', price: 1000, rarity: 'common', image: 'smartphone.png' },
    { id: 55, name: 'Laptop', type: 'electronics', price: 2000, rarity: 'uncommon', image: 'laptop.png' },
    { id: 56, name: 'Coffee Maker', type: 'appliance', price: 200, rarity: 'common', image: 'coffee_maker.png' },
    { id: 57, name: 'Smart Watch', type: 'electronics', price: 500, rarity: 'uncommon', image: 'smart_watch.png' },
    { id: 58, name: 'Gaming Console', type: 'electronics', price: 500, rarity: 'uncommon', image: 'gaming_console.png' },

    // Rich Items
    { id: 59, name: 'Diamond Watch', type: 'luxury', price: 50000, rarity: 'legendary', image: 'diamond_watch.png' },
    { id: 60, name: 'Gold Chain', type: 'luxury', price: 25000, rarity: 'epic', image: 'gold_chain.png' },
    { id: 61, name: 'Private Jet', type: 'luxury', price: 1000000, rarity: 'mythic', image: 'private_jet.png' },
    { id: 62, name: 'Yacht', type: 'luxury', price: 500000, rarity: 'mythic', image: 'yacht.png' },
    { id: 63, name: 'Art Collection', type: 'luxury', price: 200000, rarity: 'legendary', image: 'art_collection.png' },

    // Job Items
    // Farmer Items
    { id: 64, name: 'Tractor', type: 'job_tool', job: 'farmer', price: 50000, rarity: 'epic', image: 'tractor.png' },
    { id: 65, name: 'Seeds Pack', type: 'job_supply', job: 'farmer', price: 100, rarity: 'common', image: 'seeds.png' },
    
    // Engineer Items
    { id: 66, name: 'Advanced Laptop', type: 'job_tool', job: 'engineer', price: 3000, rarity: 'rare', image: 'engineering_laptop.png' },
    { id: 67, name: 'CAD Software', type: 'job_tool', job: 'engineer', price: 5000, rarity: 'epic', image: 'cad_software.png' },
    
    // Doctor Items
    { id: 68, name: 'Medical Kit', type: 'job_tool', job: 'doctor', price: 1000, rarity: 'rare', image: 'medical_kit.png' },
    { id: 69, name: 'Stethoscope', type: 'job_tool', job: 'doctor', price: 500, rarity: 'uncommon', image: 'stethoscope.png' },
    
    // Teacher Items
    { id: 70, name: 'Teaching Materials', type: 'job_supply', job: 'teacher', price: 200, rarity: 'common', image: 'teaching_materials.png' },
    { id: 71, name: 'Smart Board', type: 'job_tool', job: 'teacher', price: 2000, rarity: 'rare', image: 'smart_board.png' },
    
    // Artist Items
    { id: 72, name: 'Professional Camera', type: 'job_tool', job: 'artist', price: 3000, rarity: 'epic', image: 'camera.png' },
    { id: 73, name: 'Art Supplies Set', type: 'job_supply', job: 'artist', price: 500, rarity: 'uncommon', image: 'art_supplies.png' }
];

function generateVin() {
    return 'VIN' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

export default {
    name: 'items',
    description: 'View available items',
    category: 'items',
    data: {
        name: 'items',
        description: 'View available items'
    },
    allItems
};