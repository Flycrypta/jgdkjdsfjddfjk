import { readdirSync, existsSync, unlinkSync } from 'fs';

// Add this at the beginning of your command loading logic
const databaseErrorPath = '../db/errors/DatabaseError.js';
if (existsSync(databaseErrorPath)) {
    try {
        unlinkSync(databaseErrorPath);
        console.log('Removed duplicate DatabaseError.js file');
    } catch (err) {
        console.error('Error removing DatabaseError.js:', err);
    }
}

// ...existing code...
const commands = new Map();
// ...existing code...

// In your command loading loop, add a check
commands.forEach(file => {
    if (file.includes('DatabaseError')) {
        console.log('Skipping DatabaseError file');
        return;
    }
    // ...existing command loading code...
});

export class CommandHandler {
    // ...existing code...
}
