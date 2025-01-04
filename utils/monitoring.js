import { Logger } from './logger.js';
import { client } from 'pino';
import { register, Counter, Gauge } from 'prometheus-client';

export class MonitoringService {
    constructor() {
        this.logger = new Logger('Monitoring');
        this.metrics = {
            commandInvocations: new Counter({
                name: 'command_invocations_total',
                help: 'Total number of command invocations'
            }),
            databaseOperations: new Counter({
                name: 'database_operations_total',
                help: 'Total number of database operations'
            }),
            activeUsers: new Gauge({
                name: 'active_users',
                help: 'Number of active users'
            }),
            latency: new Gauge({
                name: 'bot_latency',
                help: 'Bot latency in milliseconds'
            })
        };

        this.startPeriodicMetrics();
    }

    trackCommand(commandName, duration) {
        this.metrics.commandInvocations.inc({ command: commandName });
        this.logger.debug(`Command executed: ${commandName} (${duration}ms)`);
    }

    async startPeriodicMetrics() {
        setInterval(() => {
            this.metrics.latency.set(this.client?.ws.ping || 0);
            this.metrics.activeUsers.set(this.client?.users.cache.size || 0);
        }, 60000);
    }
}

export const monitoring = new MonitoringService();
