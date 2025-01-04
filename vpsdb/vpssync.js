const { Client } = require('discord.js');
const fs = require('fs');
const path = require('path');

class VPSSync {
    constructor() {
        this.vpsData = new Map();
        this.dataPath = path.join(__dirname, 'vpsdata.json');
    }

    // Load data from file
    loadData() {
        try {
            if (fs.existsSync(this.dataPath)) {
                const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
                this.vpsData = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Error loading VPS data:', error);
        }
    }

    // Save data to file
    saveData() {
        try {
            const data = Object.fromEntries(this.vpsData);
            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving VPS data:', error);
        }
    }

    // Add or update VPS information
    updateVPS(vpsId, data) {
        this.vpsData.set(vpsId, {
            ...data,
            lastUpdate: Date.now()
        });
        this.saveData();
    }

    // Get VPS information
    getVPS(vpsId) {
        return this.vpsData.get(vpsId);
    }

    // Delete VPS information
    deleteVPS(vpsId) {
        this.vpsData.delete(vpsId);
        this.saveData();
    }

    // Get all VPS data
    getAllVPS() {
        return Array.from(this.vpsData.entries());
    }
}

module.exports = new VPSSync();