function validateItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return false;
    }

    return items.every(item => 
        item &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        typeof item.quantity === 'number' &&
        item.price >= 0 &&
        item.quantity > 0 &&
        Number.isInteger(item.quantity)
    );
}

module.exports = { validateItems };
