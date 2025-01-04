import { EventEmitter } from 'events';
import { CARS, CAR_MODS } from '../utils/index.js';

export class MarketSystem extends EventEmitter {
    constructor(dbManager) {
        super();
        this.dbManager = dbManager;
        this.listings = new Map();
        
        // Update market prices periodically
        setInterval(() => this.updateMarketPrices(), 300000); // Every 5 minutes
        setInterval(() => this.cleanupExpiredListings(), 3600000); // Every hour
    }

    async createListing(sellerId, itemId, quantity, price) {
        const listing = await this.dbManager.createMarketListing({
            sellerId,
            itemId,
            quantity,
            pricePerUnit: price,
            created: new Date(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        this.emit('listingCreated', listing);
        return listing;
    }

    async purchaseListing(buyerId, listingId, quantity) {
        return await this.dbManager.transaction(async () => {
            const listing = await this.dbManager.getMarketListing(listingId);
            if (!listing || listing.quantity < quantity) {
                throw new Error('Listing not available');
            }

            const totalCost = listing.pricePerUnit * quantity;
            const buyer = await this.dbManager.getUser(buyerId);
            if (buyer.coins < totalCost) {
                throw new Error('Insufficient funds');
            }

            // Process transaction
            await this.dbManager.addCoins(buyerId, -totalCost);
            await this.dbManager.addCoins(listing.sellerId, totalCost);
            await this.dbManager.updateMarketListing(listingId, {
                quantity: listing.quantity - quantity
            });

            // Add items to buyer's inventory
            await this.dbManager.addItemToInventory(buyerId, listing.itemId, quantity);

            this.emit('listingPurchased', {
                buyerId,
                sellerId: listing.sellerId,
                itemId: listing.itemId,
                quantity,
                totalCost
            });

            return { success: true, cost: totalCost };
        });
    }

    async updateMarketPrices() {
        const items = await this.dbManager.getAllMarketItems();
        for (const item of items) {
            const volatility = item.volatility || 0.1;
            const priceChange = (Math.random() - 0.5) * 2 * volatility;
            const newPrice = Math.max(
                item.basePrice * (1 + priceChange),
                item.basePrice * 0.5
            );

            await this.dbManager.updateMarketPrice(item.id, newPrice);
        }
        this.emit('pricesUpdated');
    }

    async cleanupExpiredListings() {
        const expired = await this.dbManager.getExpiredListings();
        for (const listing of expired) {
            // Return items to seller's inventory
            await this.dbManager.addItemToInventory(
                listing.sellerId,
                listing.itemId,
                listing.quantity
            );
            await this.dbManager.removeListing(listing.id);
            
            this.emit('listingExpired', listing);
        }
    }

    async getMarketStatistics() {
        return {
            totalListings: await this.dbManager.getActiveListingsCount(),
            totalValue: await this.dbManager.getTotalMarketValue(),
            mostTraded: await this.dbManager.getMostTradedItems(10),
            recentSales: await this.dbManager.getRecentSales(10)
        };
    }
}
