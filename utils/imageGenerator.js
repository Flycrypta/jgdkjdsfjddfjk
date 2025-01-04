import OpenAI from 'openai';
import { Configuration, OpenAIApi } from 'openai';

let openaiEnabled = false;
let openaiClient = null;

try {
    if (process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        openaiEnabled = true;
    }
} catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
}

const imageCache = new Map();
const IMAGE_REFRESH_TIME = 1000 * 60 * 60; // 1 hour

export async function generateItemImage(item, forceRefresh = false) {
    if (!openaiEnabled) {
        return getDefaultImage(item.rarity);
    }

    const cacheKey = `${item.name}-${item.rarity}`;
    const cached = imageCache.get(cacheKey);
    
    if (!forceRefresh && cached && (Date.now() - cached.timestamp) < IMAGE_REFRESH_TIME) {
        return cached.url;
    }

    try {
        const prompt = generatePrompt(item);
        const response = await openaiClient.images.generate({
            prompt,
            n: 1,
            size: "512x512",
            response_format: "url"
        });

        const imageUrl = response.data[0].url;
        imageCache.set(cacheKey, {
            url: imageUrl,
            timestamp: Date.now()
        });

        return imageUrl;
    } catch (error) {
        console.error('Error generating image:', error);
        return getDefaultImage(item.rarity);
    }
}

function generatePrompt(item) {
    const rarityEffects = {
        common: "simple, clean design, flat art style",
        uncommon: "slightly glowing, detailed design",
        rare: "magical aura, high-quality rendering",
        epic: "spectacular, ethereal glow, premium look"
    };

    return `Create a digital icon of ${item.name} with these characteristics:
        - ${rarityEffects[item.rarity]}
        - Suitable for use as a game item
        - Clean background
        - Professional product photography style
        - Centered composition
        - Subtle ${getRarityColor(item.rarity)} highlights
        - Modern and appealing design`;
}

function getRarityColor(rarity) {
    const colors = {
        common: "white",
        uncommon: "green",
        rare: "blue",
        epic: "purple"
    };
    return colors[rarity] || "white";
}

function getDefaultImage(rarity) {
    // Fallback static images if generation fails
    const defaults = {
        common: "https://cdn.discordapp.com/attachments/default_common.png",
        uncommon: "https://cdn.discordapp.com/attachments/default_uncommon.png",
        rare: "https://cdn.discordapp.com/attachments/default_rare.png",
        epic: "https://cdn.discordapp.com/attachments/default_epic.png"
    };
    return defaults[rarity];
}
