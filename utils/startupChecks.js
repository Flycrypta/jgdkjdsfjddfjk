export async function performStartupChecks() {
    const checks = {
        openai: false,
        database: false,
        discord: false
    };

    // Check OpenAI configuration
    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API key not configured. AI image generation will be disabled.');
    } else {
        checks.openai = true;
    }

    // Check Database
    try {
        await dbManager.getStats();
        checks.database = true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    }

    // Check Discord token
    if (!process.env.TOKEN) {
        console.error('❌ Discord bot token not found in environment variables');
    } else {
        checks.discord = true;
    }

    return checks;
}

export function logStartupStatus(checks) {
    console.clear(); // Clean console
    console.log('=== Bot Startup Status ===');
    console.log(`Discord: ${checks.discord ? '✅' : '❌'}`);
    console.log(`Database: ${checks.database ? '✅' : '❌'}`);
    console.log(`OpenAI: ${checks.openai ? '✅' : '⚠️'}`);
    console.log('======================\n');
}

export function setBotActivity(client) {
    client.user.setActivity('Racing Cars', { type: 'PLAYING' });
}
