const fs = require('fs');
const path = require('path');

// Ensure a logs directory or file exists if needed
const logFilePath = path.join(__dirname, 'server.log');

/**
 * A simple Express/Node.js compatible logging middleware
 * Logs the method, URL, status code, and response time.
 */
const loggingMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.connection?.remoteAddress || 'Unknown IP';
    
    // Log the incoming request
    const startMsg = `[${timestamp}] Incoming: ${method} ${url} from ${ip}`;
    console.log(startMsg);

    const start = Date.now();

    // Hook into the finish event of the response to log the outcome
    res.on('finish', () => {
        const duration = Date.now() - start;
        const endMsg = `[${timestamp}] Outgoing: ${method} ${url} - Status: ${res.statusCode} - ${duration}ms\n`;
        
        console.log(endMsg.trim());
        
        // Append to file asynchronously
        fs.appendFile(logFilePath, endMsg, (err) => {
            if (err) {
                console.error('Logging Middleware: Error writing to log file:', err);
            }
        });
    });

    next();
};

module.exports = loggingMiddleware;