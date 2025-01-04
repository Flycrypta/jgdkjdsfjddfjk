import { EmbedBuilder } from 'discord.js';

export function createEmbed(options = {}) {
    return new EmbedBuilder()
        .setColor(options.color || '#0099ff')
        .setTitle(options.title || '')
        .setDescription(options.description || '')
        .setTimestamp();
}

const STYLE_THEMES = {
    TICKET: {
        colors: [0xFF6B6B, 0x4ECDC4],
        emojis: ['🎫', '📝'],
        thumbnail: 'https://your-cdn/ticket-icon.png',
        style: 'clean'
    },
    ADMIN: {
        colors: [0xFF4B4B, 0x800000],
        emojis: ['⚡', '🔒'],
        thumbnail: 'https://your-cdn/admin-icon.png',
        style: 'sharp'
    },
    STORE: {
        colors: [0x20BF55, 0x0B4F6C],
        emojis: ['🛍️', '💎'],
        thumbnail: 'https://your-cdn/store-icon.png',
        style: 'fancy'
    },
    WHEEL: {
        colors: [0xFFBF00, 0xFF4301],
        emojis: ['🎡', '🎰'],
        thumbnail: 'https://your-cdn/wheel-icon.png',
        style: 'dynamic'
    },
    HELP: {
        colors: [0x01BAEF, 0x20639B],
        emojis: ['❓', '📚'],
        thumbnail: 'https://your-cdn/help-icon.png',
        style: 'informative'
    }
};

const styles = {
  default: {
    color: 0x0099FF,
    footer: { text: '🎮 Discord Bot' }
  },
  success: {
    color: 0x00FF00,
    footer: { text: '✅ Success' }
  },
  error: {
    color: 0xFF0000,
    footer: { text: '❌ Error' }
  },
  auction: {
    color: 0xFFA500,
    footer: { text: '🏷️ Auction House' }
  },
  inventory: {
    color: 0x800080,
    footer: { text: '🎒 Inventory' }
  },
  ticket: {
    color: 0x4B0082,
    footer: { text: '🎫 Support Ticket' }
  },
  wheel: {
    color: 0xFFD700,
    footer: { text: '🎰 Lucky Wheel' }
  },
  stats: {
    color: 0x1E90FF,
    footer: { text: '📊 Statistics' }
  },
  admin: {
    color: 0xFF4500,
    footer: { text: '⚡ Admin Panel' }
  },
  help: {
    color: 0x98FB98,
    footer: { text: '❓ Help Menu' }
  },
  coins: {
    color: 0xFFD700,
    footer: { text: '💰 Currency System' }
  },
  warning: {
    color: 0xFFA500,
    footer: { text: '⚠️ Warning' }
  },
  info: {
    color: 0x87CEEB,
    footer: { text: 'ℹ️ Information' }
  },
  special: {
    color: 0xFF1493,
    footer: { text: '🌟 Special Event' }
  },
  marketplace: {
    color: 0x32CD32,
    footer: { text: '🏪 Marketplace' }
  }
};

export function createCustomEmbed(type, title, description = '') {
    const theme = STYLE_THEMES[type] || STYLE_THEMES.DEFAULT;
    const embed = new EmbedBuilder()
        .setColor(theme.colors[Math.floor(Math.random() * theme.colors.length)])
        .setTitle(`${theme.emojis[0]} ${title} ${theme.emojis[1]}`)
        .setDescription(description)
        .setThumbnail(theme.thumbnail)
        .setTimestamp();

    switch (theme.style) {
        case 'clean':
            embed.setFooter({ text: '━━━━━━━━━━━━━━━━━━━━━━' });
            break;
        case 'sharp':
            embed.setFooter({ text: '▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰' });
            break;
        case 'fancy':
            embed.setFooter({ text: '✧･ﾟ: *✧･ﾟ:* *:･ﾟ✧*:･ﾟ✧' });
            break;
        case 'dynamic':
            embed.setFooter({ text: '🌟 Need help? Use /help 🌟' });
            break;
        case 'informative':
            embed.setFooter({ text: '📌 Tip: Create a ticket for support' });
            break;
    }

    return embed;
}

export function addCustomField(embed, name, value, inline = false) {
    return embed.addFields({ name: `❯ ${name}`, value: `\`\`\`${value}\`\`\``, inline });
}
