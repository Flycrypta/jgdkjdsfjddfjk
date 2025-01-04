export class RateLimiter {
    constructor() {
        this.limits = new Map();
    }

    tryRequest(key, cooldown) {
        const now = Date.now();
        const lastRequest = this.limits.get(key) || 0;
        
        if (now - lastRequest < cooldown * 1000) {
            return false;
        }
        
        this.limits.set(key, now);
        return true;
    }

    getRemaining(key) {
        const now = Date.now();
        const lastRequest = this.limits.get(key) || 0;
        return Math.max(0, lastRequest - now);
    }
}
