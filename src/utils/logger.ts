import { LoggerConfig, LogLevel, SentryType } from "../types/logger";


/**
 * simple logger for react apps
 */
class Logger {
    private level: LogLevel;
    private prefix: string;
    private useSentry: boolean;
    private sentryInstance?: SentryType;

    constructor(config: LoggerConfig = {}) {
        // Default level based on environment
        this.level = config.level ?? (
            process.env.NODE_ENV === 'production'
                ? LogLevel.WARN // Only warnings and errors in production
                : LogLevel.DEBUG // All logs in development
        );

        this.prefix = config.prefix ?? '';
        this.useSentry = config.useSentry ?? false;
        this.sentryInstance = config.sentryInstance;

        // Validate sentry config
        if (this.useSentry && !this.sentryInstance) {
            console.warn('Logger configured to use Sentry but no instance provided');
            this.useSentry = false;
        }
    }


    /**
     * Configure the logger
     */
    configure(config: LoggerConfig): void {
        if (config.level !== undefined) {
            this.level = config.level;
        }

        if (config.prefix !== undefined) {
            this.prefix = config.prefix;
        }

        if (config.useSentry !== undefined) {
            this.useSentry = config.useSentry;
        }

        if (config.sentryInstance !== undefined) {
            this.sentryInstance = config.sentryInstance;
        }

        // Validate sentry config
        if (this.useSentry && !this.sentryInstance) {
            console.warn('Logger configured to use Sentry but no instance provided');
            this.useSentry = false;
        }
    }



    /**
     * Set the logging level 
     */
    setLevel(level: LogLevel): void {
        this.level = level;
    }

    /**
     * Set a prefix for all log messages
     */
    setPrefix(prefix: string): void {
        this.prefix = prefix;
    }


    /**
     * Set the Sentry instance
     */
    setSentryInstance(instance: SentryType, useSentry: boolean): void {
        this.sentryInstance = instance;
        this.useSentry = useSentry;
    }

    /**
     * Log a debug message
     */
    debug(message: string, ...data: unknown[]): void {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[DEBUG] ${this.prefix} ${message}`, ...data);

            // Sentry breadcrumb (but not a captured event)
            if (this.useSentry && this.sentryInstance) {
                this.sentryInstance.addBreadcrumb({
                    category: 'debug',
                    message: `${this.prefix} ${message}`,
                    data: data.length > 0 ? this.processDataForSentry(data) : undefined,
                    level: 'info'
                })
            }
        }
    }

    /**
     * Log an info message
     */
    info(message: string, ...data: unknown[]): void {
        if (this.level <= LogLevel.INFO) {
            console.info(`[INFO] ${this.prefix} ${message}`, ...data);

            // Sentry
            if (this.useSentry && this.sentryInstance) {
                this.sentryInstance.addBreadcrumb({
                    category: 'info',
                    message: `${this.prefix} ${message}`,
                    data: data.length > 0 ? this.processDataForSentry(data) : undefined,
                    level: 'info'
                })

                // In production, also capture info as messages for important info
                if (process.env.NODE_ENV === 'production') {
                    this.sentryInstance.captureMessage(`[INFO] ${this.prefix} ${message}`, 'info')
                }
            }
        }
    }

    /**
     * Log a warning message
     */
    warn(message: string, ...data: unknown[]): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[WARN] ${this.prefix} ${message}`, ...data);

            // Sentry
            if (this.useSentry && this.sentryInstance) {
                this.sentryInstance.addBreadcrumb({
                    category: 'warning',
                    message: `${this.prefix} ${message}`,
                    data: data.length > 0 ? this.processDataForSentry(data) : undefined,
                    level: 'warning'
                })

                this.sentryInstance.captureMessage(`[WARN] ${this.prefix} ${message}`, 'warning')
            }
        }
    }

    /**
     * Log an error message
     */
    error(message: string | Error, ...data: unknown[]): void {
        if (this.level <= LogLevel.ERROR) {
            if (message instanceof Error) {
                console.error(`[ERROR] ${this.prefix} ${message.message}`, message.stack, ...data, message);
            } else {
                console.error(`[ERROR] ${this.prefix} ${message}`, ...data);
            }

            // Sentry
            if (this.useSentry && this.sentryInstance) {
                if (message instanceof Error) {
                    // For Error objects, use captureException
                    this.sentryInstance.captureException(message, {
                        extra: data.length > 0 ? this.processDataForSentry(data) : undefined
                    });
                } else {
                    // For string messages, add breadcrumb and capture message
                    this.sentryInstance.addBreadcrumb({
                        category: 'error',
                        message: `${this.prefix} ${message}`,
                        data: data.length > 0 ? this.processDataForSentry(data) : undefined,
                        level: 'error'
                    })

                    this.sentryInstance.captureMessage(`[ERROR] ${this.prefix} ${message}`, 'error')
                }
            }
        }
    }

    /**
     * Create a new logger with a specific prefix
     * Useful for component-specific logging
     */
    createLogger(name: string): Logger {
        const childLogger = new Logger({
            level: this.level,
            prefix: `[${name}]`,
            useSentry: this.useSentry,
            sentryInstance: this.sentryInstance
        })

        return childLogger;
    }

    /**
     * Process data for Sentry to ensure it can be properly serialized
     */
    private processDataForSentry(data: unknown[]): Record<string, unknown> {
        // Convert array of data to an object for Sentry
        // This helps with Sentry's data structure expectations
        if (data.length === 1 && typeof data[0] === 'object' && data[0] !== null) {
            return data[0] as Record<string, unknown>;
        }

        // If multiple items or not an object, create a numbered keys object
        return data.reduce<Record<string, unknown>>((acc, item, index) => {
            try {
                acc[`item_${index}`] = item;
                return acc;
            } catch (error) {
                acc[`item_${index}`] = 'Could not serialize for Sentry';
                console.error('[Logger] [processDataForSentry] Error serializing data for Sentry:', error);
                return acc;
            }
        }, {} as Record<string, unknown>);
    }
}


// Export a singleton instance
export const logger = new Logger();

