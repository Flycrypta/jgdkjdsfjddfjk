module.exports = {
    apps: [{
        name: 'discord-bot-api',
        script: './db/api/server.js',
        env: {
            NODE_ENV: 'production',
            API_PORT: 3000,
            API_KEY: 'your-secure-api-key'
        },
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G'
    }]
};
