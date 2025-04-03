import { logger, LogLevel } from './logger';

/**
 * Initialize the logger and other app settings
 */
export function initializeApp() {
    // Fine-tune the logger level based on environment
    if (process.env.NODE_ENV === "development") {
        // Already set to DEBUG by default
        logger.setPrefix("[DEV] ");
        logger.info("App initialized in development mode");
    }
    else if (process.env.NODE_ENV === "production") {
        // Already set to WARN by default
        logger.info("App initialized in production mode");
    } else if (process.env.NODE_ENV === "test") {
        // Disable all logging in test mode
        logger.setLevel(LogLevel.NONE);
        logger.info("App initialized in test mode");
    }

    // global error handlers ensure that no error goes unnoticed or un-logged,
    // even if it wasn't explicitly caught in a try/catch block
    window.addEventListener('error', (event) => {
        logger.error('Uncaught error', event.error || event.message);
        // Return false to allow default error handling
        return false;
    });

    window.addEventListener('unhandledrejection', (event) => {
        logger.error('Unhandled promise rejection', event.reason);
    });

}
