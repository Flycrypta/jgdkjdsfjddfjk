export const DatabaseTypes = {
    User: {
        id: 'string',
        username: 'string',
        coins: 'number',
        gems: 'number',
        level: 'number',
        xp: 'number',
        vip_level: 'number',
        inventory_slots: 'number',
        banned: 'boolean',
        banned_reason: 'string?'
    },

    Item: {
        id: 'number',
        name: 'string',
        description: 'string?',
        type: 'string',
        rarity: 'string',
        base_price: 'number',
        tradeable: 'boolean'
    },

    Car: {
        id: 'number',
        name: 'string',
        make: 'string',
        model: 'string',
        year: 'number',
        base_hp: 'number',
        base_price: 'number',
        rarity: 'string',
        region: 'string'
    },

    Property: {
        id: 'number',
        type: 'string',
        name: 'string',
        price: 'number',
        rent_income: 'number',
        garage_slots: 'number',
        location: 'string',
        tax_rate: 'number',
        appreciation_rate: 'number'
    },

    Business: {
        id: 'number',
        type: 'string',
        name: 'string',
        base_cost: 'number',
        base_income: 'number',
        required_level: 'number',
        employee_slots: 'number',
        upgrade_slots: 'number'
    },

    Job: {
        id: 'number',
        title: 'string',
        base_salary: 'number',
        required_level: 'number',
        cooldown_minutes: 'number',
        success_rate: 'number',
        bonus_multiplier: 'number'
    },

    Stock: {
        id: 'number',
        symbol: 'string',
        name: 'string',
        current_price: 'number',
        volatility: 'number'
    },

    Loan: {
        id: 'number',
        user_id: 'string',
        amount: 'number',
        interest_rate: 'number',
        term_months: 'number',
        remaining_payments: 'number',
        status: 'string'
    },

    MarketListing: {
        id: 'number',
        seller_id: 'string',
        item_type: 'string',
        item_id: 'number',
        quantity: 'number',
        price_per_unit: 'number',
        status: 'string'
    }
};

export function validateType(object, type) {
    const schema = DatabaseTypes[type];
    if (!schema) throw new Error(`Unknown type: ${type}`);

    for (const [key, expectedType] of Object.entries(schema)) {
        const isOptional = expectedType.endsWith('?');
        const baseType = isOptional ? expectedType.slice(0, -1) : expectedType;

        if (object[key] === undefined) {
            if (!isOptional) throw new Error(`Missing required field: ${key}`);
            continue;
        }

        if (object[key] === null && isOptional) continue;

        if (typeof object[key] !== baseType) {
            throw new Error(`Invalid type for ${key}: expected ${baseType}, got ${typeof object[key]}`);
        }
    }

    return true;
}
