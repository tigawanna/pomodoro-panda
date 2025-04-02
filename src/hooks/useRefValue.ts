import { useCallback, useRef } from 'react';

/**
 * A hook that provides a consistent interface for working with refs
 * @param initialValue The initial value for the ref
 * @returns A tuple containing [getValue, setValue, ref]
 */
export function useRefValue<T>(initialValue: T) {
  const ref = useRef<T>(initialValue);
  
  const setValue = useCallback((value: T) => {
    ref.current = value;
  }, []);
  
  const getValue = useCallback(() => ref.current, []);
  
  // Return as array for destructuring
  return [getValue, setValue, ref] as const;
}