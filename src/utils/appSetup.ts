import { logger } from './logger';
import { LogLevel } from '../types/logger';

/**
 * Initialize the logger and other app settings
 */
export async function initializeApp() {
    // Fine-tune the logger level based on environment
    if (process.env.NODE_ENV === "development") {
        // Already set to DEBUG by default
        logger.setPrefix("[DEV] ");
        logger.info("App initialized in development mode");
    }
    else if (process.env.NODE_ENV === "production") {
        // Already set to WARN by default
        logger.info("App initialized in production mode");

        // Check if we should use Sentry
        if (process.env.REACT_APP_USE_SENTRY === 'true' && process.env.REACT_APP_SENTRY_DSN) {
            try {
                // Dynamically import Sentry to avoid bundling in development
                const Sentry = await import('@sentry/react')

                // Initialize Sentry with the provided DSN
                Sentry.init({
                    dsn: process.env.REACT_APP_SENTRY_DSN,
                    environment: process.env.NODE_ENV,
                    beforeSend(event){
                        return event;
                    }
                })

                logger.configure({
                    useSentry: true,
                    sentryInstance: Sentry,
                })

                logger.info("Sentry initialized successfully");
            } catch (error) {
                console.error("Failed to initialize Sentry", error);
            }
        }
    } else if (process.env.NODE_ENV === "test") {
        // Disable all logging in test mode
        logger.setLevel(LogLevel.NONE);
        logger.info("App initialized in test mode");
    }

    // global error handlers ensure that no error goes unnoticed or un-logged,
    // even if it wasn't explicitly caught in a try/catch block
    // Catch all resource loading errors
    window.addEventListener('error', (event) => {
        // Check if this is a resource loading error (img, script, css, etc.)
        if (event.target && (event.target as HTMLElement).tagName) {
            const target = event.target as HTMLElement;
            const resourceUrl = (target instanceof HTMLLinkElement) ? target.href : (target as HTMLImageElement | HTMLScriptElement).src;
            logger.warn(`Resource failed to load: ${resourceUrl}`, {
                tagName: target.tagName,
                type: event.type
            });
            return true; // Prevent default error handling for resource errors
        }

        // For JavaScript errors, log and allow default handling
        logger.error('Uncaught error', event.error || event.message);
        return false;
    }, true); // The 'true' enables capturing phase which is needed for resource errors

    window.addEventListener('unhandledrejection', (event) => {
        logger.error('Unhandled promise rejection', event.reason);
    });

}
