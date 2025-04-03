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

export interface SentryType {
    captureMessage: (message: string, level?: 'info' | 'error' | 'warning') => void;
    captureException: (error: Error, captureContext?: Record<string, unknown>) => void;
    addBreadcrumb: (breadcrumb: {
        category?: string;
        message?: string;
        data?: Record<string, unknown>;
        level?: 'info' | 'error' | 'warning';
        timestamp?: number;    // Unix timestamp
        filename?: string;     // Call site location
    }) => void;
}

export interface LoggerConfig {
    level?: LogLevel;
    prefix?: string;
    useSentry?: boolean;
    sentryInstance?: SentryType;
    browserId?: string;
}


