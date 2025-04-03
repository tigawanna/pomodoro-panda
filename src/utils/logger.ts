/**
 * Define available log levels
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

/**
 * simple logger for react apps
 */
class Logger {
    private level: LogLevel;
    private prefix: string;

    constructor(level: LogLevel = LogLevel.DEBUG, prefix: string = '') {
        this.level = level;
        this.prefix = prefix;
    }
    /**
      * Create a new logger with a specific prefix
      * Useful for component-specific logging
     */
    createLogger(name: string): Logger {
        return new Logger(this.level, `[${name}] `);
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
     * Log a debug message
     */
    debug(message: string, ...data: unknown[]): void {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[DEBUG] ${this.prefix} ${message}`, ...data);
        }
    }

    /**
     * Log an info message
     */
    info(message: string, ...data: unknown[]): void {
        if (this.level <= LogLevel.INFO) {
            console.info(`[INFO] ${this.prefix} ${message}`, ...data);
        }
    }

    /**
     * Log a warning message
     */
    warn(message: string, ...data: unknown[]): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[WARN] ${this.prefix} ${message}`, ...data);
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
        }
    }

}



// Default level based on environment
const DEFAULT_LEVEL = process.env.NODE_ENV === 'production'
    ? LogLevel.WARN  // Only warnings and errors in production
    : LogLevel.DEBUG; // All logs in development

// Export a singleton instance with environment-specific defaults
export const logger = new Logger(DEFAULT_LEVEL);

