const fs = require('fs');
const mysql = require('mysql');
const path = require('path');

// Error logging function
function logError(error, operation) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${operation}: ${error.message}\n`;
    const logPath = path.join(__dirname, 'logs', 'vps-errors.log');

    // Ensure logs directory exists
    fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });

    // Append error to log file
    fs.appendFileSync(logPath, logMessage);
}

// Database connection error handler
function handleDBConnectionError(error) {
    logError(error, 'Database Connection');
    return {
        success: false,
        error: 'Database connection failed',
        details: error.message
    };
}

// Query error handler
function handleQueryError(error) {
    logError(error, 'Query Execution');
    return {
        success: false,
        error: 'Query execution failed',
        details: error.message
    };
}

// File system error handler
function handleFSError(error) {
    logError(error, 'File System');
    return {
        success: false,
        error: 'File system operation failed',
        details: error.message
    };
}

module.exports = {
    handleDBConnectionError,
    handleQueryError,
    handleFSError,
    logError
};