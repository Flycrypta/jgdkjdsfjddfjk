import { Client } from 'discord.js';

export class Activity {
    constructor(client) {
        this.client = client;
    }

    setActivity(status) {
        if (this.client.user) {
            this.client.user.setActivity(status);
        }
    }
}

export const activity = new Activity();