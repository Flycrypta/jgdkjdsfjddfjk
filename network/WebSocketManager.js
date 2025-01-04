import WebSocket from 'ws';
import { EventEmitter } from 'events';

export class WebSocketManager extends EventEmitter {
    constructor(server) {
        super();
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map();
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            const userId = this.authenticateConnection(req);
            if (!userId) {
                ws.close();
                return;
            }

            this.clients.set(userId, ws);

            ws.on('message', (data) => {
                this.handleMessage(userId, data);
            });

            ws.on('close', () => {
                this.clients.delete(userId);
            });
        });
    }

    broadcastRaceUpdate(raceId, updateData) {
        const message = JSON.stringify({
            type: 'race_update',
            raceId,
            data: updateData
        });

        this.broadcast(message, updateData.participantIds);
    }

    broadcastMarketUpdate(updateData) {
        const message = JSON.stringify({
            type: 'market_update',
            data: updateData
        });

        this.broadcast(message);
    }

    broadcast(message, userIds = null) {
        if (userIds) {
            // Broadcast to specific users
            userIds.forEach(userId => {
                const client = this.clients.get(userId);
                if (client?.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else {
            // Broadcast to all
            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }

    authenticateConnection(req) {
        // Implement your authentication logic here
        return req.headers['user-id'];
    }

    handleMessage(userId, data) {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case 'race_join':
                    this.emit('raceJoin', { userId, raceId: message.raceId });
                    break;
                case 'market_bid':
                    this.emit('marketBid', { userId, listingId: message.listingId, amount: message.amount });
                    break;
                default:
                    console.warn(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    }
}
