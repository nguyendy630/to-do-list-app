const winston = require('winston');

// 1. Define a custom format using printf
const customFormat = winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    // Include the stack trace if it exists, otherwise use the message
    let log = `${timestamp} [${level}]: ${stack || message}`;
    
    // If there is extra metadata (like a user ID or object), stringify it
    if (Object.keys(metadata).length > 0) {
        log += ` | Meta: ${JSON.stringify(metadata)}`;
    }
    return log;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Adds a readable date
        winston.format.errors({ stack: true }), // Captures the full error stack trace
        winston.format.colorize(), // Makes levels like "info" or "error" stand out
        customFormat
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;
