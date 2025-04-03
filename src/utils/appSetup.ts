import { logger } from './logger';
import { LogLevel } from '../types/logger';
import * as Sentry from '@sentry/react';

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
        if (import.meta.env.VITE_USE_SENTRY === 'true' && import.meta.env.VITE_SENTRY_DSN) {
            try {
                Sentry.init({
                    dsn: import.meta.env.VITE_SENTRY_DSN,
                    environment: process.env.NODE_ENV,
                    debug: false,
                    integrations: [
                        Sentry.browserTracingIntegration(),
                        Sentry.replayIntegration(),
                    ],
                    tracesSampleRate: 1.0,
                    replaysSessionSampleRate: 0.1,
                    replaysOnErrorSampleRate: 1.0,
                });

                // Verify initialization
                // Sentry.captureMessage('Sentry Initialization Test');
                logger.configure({
                    useSentry: true,
                    sentryInstance: Sentry,
                });

                // logger.info("Sentry initialized successfully");
            } catch (error) {
                console.error("Failed to initialize Sentry:", error);
            }
        } else {
            console.warn('Sentry configuration missing:', {
                useSentry: import.meta.env.VITE_USE_SENTRY,
                hasDSN: !!import.meta.env.VITE_SENTRY_DSN
            });
        }
    } else if (process.env.NODE_ENV === "test") {
        // Disable all logging in test mode
        logger.setLevel(LogLevel.NONE);
        logger.info("App initialized in test mode");
    }

    // global error handlers ensure that no error goes unnoticed or un-logged
    window.addEventListener('error', (event) => {
        // Check if this is a resource loading error
        if (event.target && (event.target as HTMLElement).tagName) {
            const target = event.target as HTMLElement;
            const resourceUrl = (target instanceof HTMLLinkElement) ? target.href : (target as HTMLImageElement | HTMLScriptElement).src;

            logger.warn(`Resource failed to load: ${resourceUrl}`, {
                tagName: target.tagName,
                type: event.type
            });

            Sentry.captureMessage(`Resource failed to load: ${resourceUrl}`, 'warning');
            return true; // Prevent default handling for resource errors
        }

        // For JavaScript errors
        logger.error('Uncaught error', event.error || event.message);
        Sentry.captureException(event.error || new Error(event.message));
        return false;
    }, true);

    window.addEventListener('unhandledrejection', (event) => {
        logger.error('Unhandled promise rejection', event.reason);
        Sentry.captureException(event.reason);
    });
}
