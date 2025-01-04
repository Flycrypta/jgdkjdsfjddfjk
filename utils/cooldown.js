const cooldowns = new Map();

export function checkCooldown(userId, commandName, cooldownTime = 3000) {
    const key = `${userId}-${commandName}`;
    const now = Date.now();
    const lastUsed = cooldowns.get(key) || 0;

    if (now - lastUsed < cooldownTime) {
        const remaining = (cooldownTime - (now - lastUsed)) / 1000;
        return Math.ceil(remaining);
    }

    cooldowns.set(key, now);
    return 0;
}

export function clearCooldown(userId, commandName) {
    const key = `${userId}-${commandName}`;
    cooldowns.delete(key);
}
