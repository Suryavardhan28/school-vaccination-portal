import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to log all API requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    // Store the start time to calculate response time
    const start = Date.now();

    // Original URL path
    const path = req.originalUrl || req.url;

    // Log request details
    console.log(`[${new Date().toISOString()}] REQUEST: ${req.method} ${path}`);

    // Log query parameters if present
    if (Object.keys(req.query).length > 0) {
        console.log(`[${new Date().toISOString()}] QUERY:`, JSON.stringify(req.query));
    }

    // Log request body for POST/PUT/PATCH requests, but omit sensitive fields
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        // Create a sanitized copy of the body for logging
        const sanitizedBody = { ...req.body };

        // Omit sensitive information like passwords
        if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
        if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';

        console.log(`[${new Date().toISOString()}] BODY:`, JSON.stringify(sanitizedBody));
    }

    // Capture and log the response
    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - start;

        // Log response details
        console.log(`[${new Date().toISOString()}] RESPONSE: ${req.method} ${path} ${res.statusCode} - ${responseTime}ms`);

        // Pass back to the original send
        return originalSend.call(this, body);
    };

    next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${req.method} ${req.originalUrl || req.url}`);
    console.error(`[${new Date().toISOString()}] ERROR MESSAGE: ${err.message}`);
    console.error(`[${new Date().toISOString()}] ERROR STACK: ${err.stack}`);

    next(err);
}; 