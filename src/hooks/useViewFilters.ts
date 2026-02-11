import { useMemo } from 'react';
import { FilterState } from '@/types';

/**
 * Custom hook to manage modal and comparison filters for dashboard views
 * 
 * This hook creates memoized filter objects for modal and comparison contexts,
 * avoiding unnecessary recalculations when parent components re-render.
 * 
 * @param filters - Base filter state from the dashboard
 * @param modalClientId - Optional client ID to filter modal data (overrides filters.clientId)
 * 
 * @returns Object containing:
 *   - modalFilters: Filters with modalClientId applied (for modal data fetching)
 *   - comparisonFilters: Filters with comparison period (for comparison mode)
 * 
 * @example
 * ```tsx
 * const { modalFilters, comparisonFilters } = useViewFilters(filters, modalClientId);
 * 
 * // Use in data fetching
 * const { data } = useOverview('cafe', modalFilters, { enabled: isModalOpen });
 * const { data: compareData } = useOverview('cafe', comparisonFilters, { enabled: isComparing });
 * ```
 */
export function useViewFilters(
    filters: FilterState,
    modalClientId?: string
) {
    const modalFilters = useMemo(() => ({
        ...filters,
        clientId: modalClientId
    }), [filters, modalClientId]);

    const comparisonFilters = useMemo(() => ({
        ...filters,
        period: filters.comparePeriod || filters.period
    }), [filters]);

    return { modalFilters, comparisonFilters };
}
