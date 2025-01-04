export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
};

export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Add any other helper functions needed by your application
