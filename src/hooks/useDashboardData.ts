import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { FilterState } from '@/types';
import { fetchOverview, fetchEvolution, fetchDistribution } from '@/services/dashboard-api';
import { CACHE_TIME } from '@/config/constants';

/**
 * Hook pour charger les données de synthèse (Overview).
 * 
 * Utilise React Query pour gérer la mise en cache et le cycle de vie de la requête.
 * 
 * @param view - Identifiant de la vue ('cafe', 'equipement', 'service', etc.).
 * @param filters - Filtres appliqués (périodes, segments, régions).
 * @returns L'objet Query de React Query contenant `data`, `isLoading`, `error`, etc.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useOverview('cafe', filters);
 * ```
 */
export function useOverview(view: string, filters: FilterState, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['overview', view, filters],
        queryFn: () => fetchOverview(view, filters),
        staleTime: CACHE_TIME.STALE_TIME,
        gcTime: CACHE_TIME.CACHE_TIME,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        placeholderData: (previousData) => previousData,
        enabled: options?.enabled !== undefined ? options.enabled : true,
    });
}

/**
 * Hook pour charger les données d'évolution.
 * 
 * Utilise React Query pour gérer la mise en cache et le cycle de vie de la requête.
 * 
 * @param view - Identifiant de la vue ('cafe', 'equipement', 'service', etc.).
 * @param filters - Filtres appliqués (l'année est extraite de `filters.period`).
 * @param options - Options supplémentaires pour React Query (ex: enabled).
 * @returns L'objet Query de React Query contenant `data`, `isLoading`, `error`, etc.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useEvolution('cafe', filters);
 * ```
 */
export function useEvolution(view: string, filters: FilterState, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['evolution', view, filters],
        queryFn: () => fetchEvolution(view, filters),
        staleTime: CACHE_TIME.STALE_TIME,
        gcTime: CACHE_TIME.CACHE_TIME,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        placeholderData: (previousData) => previousData,
        enabled: options?.enabled !== undefined ? options.enabled : true,
    });
}

/**
 * Hook pour charger les données de distribution.
 * 
 * @param view - Identifiant de la vue ('cafe', 'service').
 * @param filters - Filtres appliqués.
 * @param options - Options supplémentaires pour React Query.
 * @returns L'objet Query de React Query.
 */
export function useDistribution(view: string, filters: FilterState, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['distribution', view, filters],
        queryFn: () => fetchDistribution(view, filters),
        staleTime: CACHE_TIME.STALE_TIME,
        gcTime: CACHE_TIME.CACHE_TIME,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        placeholderData: (previousData) => previousData,
        enabled: options?.enabled !== undefined ? options.enabled : true,
    });
}

/**
 * Hook pour pré-charger les données d'une vue
 * Utile pour améliorer l'UX lors de la navigation
 * 
 * @param view - Identifiant de la vue à pré-charger
 * @param filters - Filtres à appliquer
 */
export function usePrefetchDashboardData(view: string, filters: FilterState) {
    const queryClient = useQueryClient();

    return () => {
        // Prefetch overview
        queryClient.prefetchQuery({
            queryKey: ['overview', view, filters],
            queryFn: () => fetchOverview(view, filters),
            staleTime: CACHE_TIME.STALE_TIME,
        });

        // Prefetch evolution
        queryClient.prefetchQuery({
            queryKey: ['evolution', view, filters],
            queryFn: () => fetchEvolution(view, filters),
            staleTime: CACHE_TIME.STALE_TIME,
        });

        // Prefetch distribution
        queryClient.prefetchQuery({
            queryKey: ['distribution', view, filters],
            queryFn: () => fetchDistribution(view, filters),
            staleTime: CACHE_TIME.STALE_TIME,
        });
    };
}

