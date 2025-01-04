export * from './gameData.js';
export * from './commands.js';
export * from './ticketConfig.js';
export * from './wheels.js';

export const DB_CONFIG = {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null,
    fileMustExist: false
};
