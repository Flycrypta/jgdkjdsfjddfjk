import { allItems } from '../utils/itemsList.js';
import { WHEEL_IMAGES } from './assets.js';

export const WHEELS = {
    BASIC: {
        id: 1,
        name: 'Snack Wheel',
        cost: 100,
        items: [allItems[1], allItems[2], allItems[3]],
        color: 0x969696,
        image: WHEEL_IMAGES.BASIC,
        displayName: '☕ Snack Wheel'
    },
    UNCOMMON: {
        id: 2,
        name: 'Food Wheel',
        cost: 250,
        items: [allItems.PIZZA, allItems.BURGER, allItems.ICECREAM, allItems.TACO, allItems.SUSHI],
        color: 0x1eff00,
        image: WHEEL_IMAGES.UNCOMMON,
        displayName: '🍔 Food Wheel'
    },
    RARE: {
        id: 3,
        name: 'Entertainment Wheel',
        cost: 500,
        items: [allItems.GAMING_PASS, allItems.MOVIE_TICKET, allItems.CONCERT_PASS, allItems.GIFT_CARD, allItems.HEADPHONES],
        color: 0x0070dd,
        image: WHEEL_IMAGES.RARE,
        displayName: '🎟️ Entertainment Wheel'
    },
    EPIC: {
        id: 4,
        name: 'Tech Wheel',
        cost: 1000,
        items: [allItems.PHONE_CASE, allItems.BLUETOOTH_SPEAKER, allItems.SMARTWATCH, allItems.AIRPODS, allItems.GAMING_CHAIR],
        color: 0xa335ee,
        image: WHEEL_IMAGES.EPIC,
        displayName: '📱 Tech Wheel'
    },
    MEGA: {
        id: 5,
        name: 'Mega Wheel',
        cost: 2000,
        items: [allItems.GIFT_CARD, allItems.HEADPHONES, allItems.SMARTWATCH, allItems.AIRPODS, allItems.GAMING_CHAIR],
        color: 0xff8000,
        image: WHEEL_IMAGES.MEGA,
        displayName: '🎁 Mega Wheel'
    },
    PREMIUM: {
        id: 6,
        name: 'Premium Wheel',
        cost: 5000,
        items: [allItems.CONCERT_PASS, allItems.BLUETOOTH_SPEAKER, allItems.SMARTWATCH, allItems.AIRPODS, allItems.GAMING_CHAIR],
        color: 0xff0000,
        image: WHEEL_IMAGES.PREMIUM,
        displayName: '💎 Premium Wheel'
    },
    BOOSTER: {
        id: 7,
        name: 'Booster Wheel',
        cost: 10000,
        requiresRole: 'PREMIUM',
        items: [allItems.GAMING_CHAIR, allItems.AIRPODS, allItems.SMARTWATCH],
        color: 0xff00ff,
        image: WHEEL_IMAGES.BOOSTER,
        displayName: '🚀 Booster Wheel'
    }
};
