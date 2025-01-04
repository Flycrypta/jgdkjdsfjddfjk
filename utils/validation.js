export function validateDate(dateString) {
    try {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    } catch (error) {
        console.error('Error validating date:', error);
        return false;
    }
}

export function validatePermissions(permissions) {
    try {
        const validPermissions = [
            'ADMIN',
            'MODERATE',
            'VIEW_DASHBOARD',
            'MANAGE_ECONOMY',
            'BYPASS_RATE_LIMIT'
        ];

        return permissions.every(perm => validPermissions.includes(perm));
    } catch (error) {
        console.error('Error validating permissions:', error);
        return false;
    }
}

export function validateBackupFile(filename) {
    try {
        // Validate file extension
        if (!filename.endsWith('.db')) return false;

        // Validate filename format (backup-YYYY-MM-DD-HH-mm-ss.db)
        const pattern = /^backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.db$/;
        return pattern.test(filename);
    } catch (error) {
        console.error('Error validating backup file:', error);
        return false;
    }
}
