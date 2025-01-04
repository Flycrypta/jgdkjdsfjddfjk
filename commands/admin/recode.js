import { readFile, writeFile } from 'fs/promises';
import { EmbedBuilder } from 'discord.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const addItemCommand = {
    name: 'additem',
    description: 'Add items such as cars with editable carfaxes',
    async execute(message, args) {
        if (!args.length) {
            return message.channel.send('Please provide the item details.');
        }

        const itemType = args[0];
        const itemName = args[1];
        const itemDetails = args.slice(2).join(' ');

        if (!itemType || !itemName || !itemDetails) {
            return message.channel.send('Please provide the item type, name, and details.');
        }

        const itemData = {
            type: itemType,
            name: itemName,
            details: itemDetails,
            // Add additional properties for wheelspins, trading, etc.
            wheelspin: args.includes('wheelspin'),
            tradable: args.includes('tradable'),
            // Add new properties for daily use, jobs, etc.
            dailyUse: args.includes('dailyUse'),
            jobItem: args.includes('jobItem'),
            car: args.includes('car'),
            home: args.includes('home')
        };

        const itemsPath = join(__dirname, '../../data/items.json');

        try {
            const data = await readFile(itemsPath, 'utf8');
            const items = JSON.parse(data);
            items.push(itemData);
            await writeFile(itemsPath, JSON.stringify(items, null, 2));
            await message.channel.send(`Item ${itemName} added successfully.`);
        } catch (err) {
            if (err.code === 'ENOENT') {
                await writeFile(itemsPath, JSON.stringify([itemData], null, 2));
                await message.channel.send(`Item ${itemName} added successfully.`);
            } else {
                throw err;
            }
        }
    }
};

export default addItemCommand;
