export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

export function parseTime(timeStr) {
    return new Date(timeStr).getTime();
}

export function validateInput(input, schema) {
    for (const [key, rules] of Object.entries(schema)) {
        if (!input[key] && rules.required) {
            throw new Error(`${key} is required`);
        }
    }
    return true;
}

export function generateVIN() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let vin = '';
    for (let i = 0; i < 17; i++) {
        vin += chars[Math.floor(Math.random() * chars.length)];
    }
    return vin;
}

// Add other helper functions as needed
