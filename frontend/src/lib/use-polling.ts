import React, { useEffect, useRef, useCallback } from 'react';

interface PollingOptions {
    interval: number;
    enabled: boolean;
    onError?: (error: Error) => void;
}

/**
 * Hook for polling data at regular intervals
 */
export function usePolling<T>(
    fetchFn: () => Promise<T>,
    options: PollingOptions
): { data: T | null; loading: boolean; error: Error | null; refresh: () => Promise<void> } {
    const [data, setData] = React.useState<T | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            setLoading(true);
            const result = await fetchFn();
            if (isMountedRef.current) {
                setData(result);
                setError(null);
            }
        } catch (err) {
            if (isMountedRef.current) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                options.onError?.(error);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [fetchFn, options]);

    useEffect(() => {
        // Initial fetch
        if (options.enabled) {
            fetchData();
        }

        // Set up polling
        if (options.enabled) {
            intervalRef.current = setInterval(fetchData, options.interval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [options.enabled, options.interval, fetchData]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return { data, loading, error, refresh: fetchData };
}
