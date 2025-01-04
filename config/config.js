export default {
    // Bot Configuration
    prefix: '!',
    defaultCooldown: 3,
    
    // Categories
    ticketCategory: 'TICKETS',
    archiveCategory: 'ARCHIVED',
    
    // Roles
    adminRole: 'Admin',
    modRole: 'Moderator',
    supportRole: 'Support',
    
    // Channels
    logChannel: 'bot-logs',
    welcomeChannel: 'welcome',
    
    // Timeouts (in milliseconds)
    ticketTimeout: 24 * 60 * 60 * 1000, // 24 hours
    muteDuration: 60 * 60 * 1000, // 1 hour
    
    // Database
    dbName: 'bot.sqlite',
    
    // API Settings
    apiPort: process.env.PORT || 3000,
    
    // Command Categories
    commandCategories: [
        'Admin',
        'General',
        'Moderation',
        'Tickets',
        'Utils'
    ],
    
    // Colors
    colors: {
        primary: 0x1d82b6,
        success: '#00ff00',
        error: '#ff0000',
        warning: '#ffff00',
        info: '#0000ff'
    },
    categories: {
        tickets: 'Support Tickets',
        closed: 'Closed Tickets'
    },
    wheels: {
        common: { cost: 100, color: 0x969696 },
        rare: { cost: 500, color: 0x0099ff },
        legendary: { cost: 1000, color: 0xffd700 }
    },
    timeouts: {
        buttonCollector: 60000,
        ticketDeletion: 24 * 60 * 60 * 1000
    }
};
