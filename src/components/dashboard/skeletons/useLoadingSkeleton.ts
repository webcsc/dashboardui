import React from 'react';

/**
 * Hook personnalisé pour gérer l'affichage des skeletons
 * @example
 * ```tsx
 * const { data, isLoading } = useOverview('cafe', filters);
 * 
 * if (useLoadingSkeleton(isLoading, data)) {
 *   return <UniverseViewSkeleton />;
 * }
 * ```
 */
export function useLoadingSkeleton<T>(...dataOrLoading: (boolean | T | undefined | null)[]): boolean {
    return dataOrLoading.some(item => {
        if (typeof item === 'boolean') {
            return item; // isLoading flag
        }
        return !item; // data is undefined/null
    });
}

/**
 * Composant HOC pour wrapper une vue avec un skeleton loader
 * @example
 * ```tsx
 * export const CafeView = withSkeleton(
 *   UniverseViewSkeleton,
 *   ({ filters }) => {
 *     const { data, isLoading } = useOverview('cafe', filters);
 *     return { shouldShowSkeleton: isLoading || !data };
 *   }
 * )(CafeViewComponent);
 * ```
 */
export function withSkeleton<P extends Record<string, unknown>>(
    SkeletonComponent: React.ComponentType,
    useLoadingState: (props: P) => { shouldShowSkeleton: boolean }
) {
    return function withSkeletonWrapper(Component: React.ComponentType<P>) {
        const WithSkeletonComponent = (props: P) => {
            const { shouldShowSkeleton } = useLoadingState(props);

            if (shouldShowSkeleton) {
                return React.createElement(SkeletonComponent);
            }

            return React.createElement(Component, props);
        };

        WithSkeletonComponent.displayName = `withSkeleton(${Component.displayName || Component.name || 'Component'})`;

        return WithSkeletonComponent;
    };
}
