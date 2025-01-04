import dotenv from 'dotenv';
dotenv.config();

export const config = {
    clientId: process.env.CLIENT_ID,
    token: process.env.TOKEN,
    database: {
        path: './data/bot.db'
    }
    // ...other config options...
};
