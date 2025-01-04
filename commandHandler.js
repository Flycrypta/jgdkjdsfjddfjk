import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCommands(commandsPath) {
    try {
        const entries = await readdir(commandsPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(commandsPath, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively load commands from subdirectories
                await loadCommands(fullPath);
                continue;
            }
            
            if (!entry.name.endsWith('.js')) continue;

            const command = await import(`file://${fullPath}`);
            if (command.data && command.execute) {
                // Register command
                // ...existing registration code...
            }
        }
    } catch (error) {
        console.error('❌ Failed to load commands:', error);
    }
}

const commandsPath = path.join(__dirname, 'commands');
loadCommands(commandsPath);
