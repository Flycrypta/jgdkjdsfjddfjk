export const TICKET_CATEGORIES = {
    SUPPORT: {
        name: 'General Support',
        timeout: 24 * 60 * 60 * 1000, // 24 hours
        extendable: true,
        maxExtensions: 2,
        reminderTime: 60 * 60 * 1000 // 1 hour before closing
    },
    BUG_REPORT: {
        name: 'Bug Report',
        timeout: 72 * 60 * 60 * 1000, // 72 hours
        extendable: true,
        maxExtensions: 3,
        reminderTime: 2 * 60 * 60 * 1000 // 2 hours before closing
    },
    FEATURE_REQUEST: {
        name: 'Feature Request',
        timeout: 168 * 60 * 60 * 1000, // 1 week
        extendable: false,
        reminderTime: 24 * 60 * 60 * 1000 // 24 hours before closing
    }
};

export const TICKET_PERMISSIONS = {
    CREATE: 'CREATE_TICKET',
    CLOSE: 'CLOSE_TICKET',
    EXTEND: 'EXTEND_TICKET',
    VIEW_HISTORY: 'VIEW_TICKET_HISTORY',
    MANAGE: 'MANAGE_TICKETS'
};
