import * as Sentry from '@sentry/react';

export function TestSentryButton() {
    const throwError = () => {
        try {
            throw new Error('Test Sentry Error');
        } catch (error) {
            Sentry.captureException(error);
            console.error('Error thrown for Sentry:', error);
        }
    };

    return (
        <button onClick={throwError}>
            Test Sentry Error
        </button>
    );
}
