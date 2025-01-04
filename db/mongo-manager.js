import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define schemas
const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    coins: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    rarity: { type: String, default: 'common' },
    price: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const inventorySchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1 }
});

export class MongoManager {
    constructor() {
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const configPath = path.join(__dirname, 'mongo-config.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8')).mongodb;

            await mongoose.connect(config.uri + '/' + config.database, config.options);
            console.log('✅ Connected to MongoDB');

            // Initialize models
            this.User = mongoose.model('User', userSchema);
            this.Item = mongoose.model('Item', itemSchema);
            this.Inventory = mongoose.model('Inventory', inventorySchema);

        } catch (error) {
            console.error('❌ MongoDB initialization failed:', error);
            throw error;
        }
    }

    async getUser(userId, username = `user_${userId}`) {
        try {
            let user = await this.User.findOne({ id: userId });
            if (!user) {
                user = await this.User.create({ id: userId, username });
            }
            return user;
        } catch (error) {
            console.error(`Failed to get/create user ${userId}:`, error);
            throw error;
        }
    }

    async addCoins(userId, amount, source = 'unknown') {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const user = await this.User.findOneAndUpdate(
                { id: userId },
                { $inc: { coins: amount } },
                { new: true, session }
            );
            await session.commitTransaction();
            return user.coins;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async createItem(name, description, rarity = 'common', price = 0) {
        return await this.Item.create({
            name,
            description,
            rarity,
            price
        });
    }

    async addItemToInventory(userId, itemId, quantity = 1) {
        return await this.Inventory.findOneAndUpdate(
            { userId, itemId },
            { $inc: { quantity } },
            { upsert: true, new: true }
        );
    }

    async getUserInventory(userId) {
        try {
            return await this.Inventory.find({ userId }).populate('itemId');
        } catch (error) {
            console.error(`Failed to get inventory for user ${userId}:`, error);
            throw error;
        }
    }
}

export const mongoManager = new MongoManager();
