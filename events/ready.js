import { Logger } from '../utils/logger.js';

const log = new Logger('ReadyEvent');

export const name = 'ready';
export const once = true;

export function execute(client) {
    log.info(`Logged in as ${client.user.tag}`);
    client.user.setActivity('with commands', { type: 'PLAYING' });
}
