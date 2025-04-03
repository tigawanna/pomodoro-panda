import { useMemo } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook for using the logger within React components
 * @param componentName - Name of the component for prefixing log messages
 */
export function useLogger(componentName: string) {
    return useMemo(() => {
        return logger.createLogger(componentName);
    }, [componentName]);
}