import { useCallback } from 'react';
import { calculateTrend } from '@/lib/trend-utils';
import { formatPrice } from '@/lib';

/**
 * Custom hook providing helper functions for comparison mode
 * 
 * Encapsulates common comparison logic used across dashboard views,
 * including trend calculation and previous value formatting.
 * 
 * @param isComparing - Whether comparison mode is currently active
 * 
 * @returns Object containing helper functions:
 *   - getTrend: Calculate trend percentage between current and previous values
 *   - getPreviousValue: Format previous value with optional suffix
 *   - getPreviousCurrencyValue: Format previous value as currency (k€)
 * 
 * @example
 * ```tsx
 * const { getTrend, getPreviousValue } = useComparisonHelpers(isComparing);
 * 
 * <KpiCard
 *   value={caTotal}
 *   previousValue={getPreviousValue(caPrevious, '€')}
 *   trend={getTrend(caTotal, caPrevious)}
 * />
 * ```
 */
export function useComparisonHelpers(isComparing: boolean) {
    /**
     * Calculate trend percentage between current and previous values
     * 
     * @param current - Current period value
     * @param previous - Previous period value
     * @returns Trend percentage or undefined if not comparing or previous is 0
     */
    const getTrend = useCallback((current?: number | string, previous?: number | string) => {
        if (!isComparing || previous === undefined || previous === null) {
            return undefined;
        }
        const currentVal = Number(current);
        const previousVal = Number(previous);

        if (isNaN(currentVal) || isNaN(previousVal) || previousVal === 0) {
            return undefined;
        }
        return calculateTrend(currentVal, previousVal).value;
    }, [isComparing]);

    /**
     * Format previous value with optional suffix
     * 
     * @param value - Previous period value
     * @param suffix - Optional suffix to append (e.g., '€', '%', 'kg')
     * @returns Formatted string or '-' if not comparing or value undefined
     */
    const getPreviousValue = useCallback((value?: number, suffix: string = '') => {
        if (!isComparing || value === undefined) {
            return '-';
        }
        return `${value}${suffix}`;
    }, [isComparing]);

    /**
     * Format previous value as compact currency (thousands with 'k€')
     * 
     * @param value - Previous period value in euros
     * @returns Formatted currency string (e.g., "12.5k€") or '-' if not comparing
     */
    const getPreviousCurrencyValue = useCallback((value?: number | string) => {
        if (!isComparing || value === undefined || value === null) {
            return '-';
        }
        const numVal = Number(value);
        if (isNaN(numVal)) return '-';
        return formatPrice(numVal);
    }, [isComparing]);

    return {
        getTrend,
        getPreviousValue,
        getPreviousCurrencyValue
    };
}
