import { ReactNode } from 'react';
import { ProductCategorySection } from '@/components/dashboard/sections/ProductCategorySection';
import { formatPrice, formatWeight } from '@/lib/formatters';
import type { TableColumn } from '@/types';
import type { ProductMap } from '@/types/products';

interface RenderProductViewOptions {
    products: Record<string, ProductMap> | null | undefined;
    compareProducts?: Record<string, ProductMap> | null | undefined;
    isComparing: boolean;
    getTrend: (current: number, previous: number | undefined) => number;
    variant: 'cafe' | 'equipement' | 'service';
    icon: ReactNode;
    matchKey?: string;
    mainLabel?: string;
    clientId?: string;
    onClientChange?: (id: string) => void;
    filters?: import('@/types').FilterState;
}

interface MergedProduct extends Record<string, string | number | undefined> {
    prev_ca?: number;
    trend_ca?: number;
    prev_vol?: number;
    trend_vol?: number;
}

/**
 * Render product sections with optional comparison data
 * 
 * @param options Configuration options
 * @returns Array of ProductCategorySection components or null
 */
export function renderProductView({
    products,
    compareProducts,
    isComparing,
    getTrend,
    variant,
    icon,
    matchKey = 'type',
    mainLabel = 'Type',
    clientId,
    onClientChange,
    filters,
}: RenderProductViewOptions): ReactNode {
    if (!products) return null;

    return Object.entries(products).map(([category, productList]: [string, ProductMap]) => {
        // 1. Get current rows
        const currentRows = Object.values(productList ?? {});

        if (!currentRows.length) return null;

        // 2. Get comparison rows (if any)
        const compareList = compareProducts?.[category];
        const compareRows = Array.isArray(compareList)
            ? compareList
            : Object.values(compareList ?? {});

        // 3. Merge data with comparison
        const mergedData: MergedProduct[] = currentRows.map((row) => {
            // Find matching row in previous period by matchKey
            const currentMatchValue = row[matchKey];

            const prevRow = compareRows.find((p) => {
                const prevMatchValue = p[matchKey];
                return prevMatchValue === currentMatchValue;
            });

            const currentCA = row.ca_total_ht || 0;
            const prevCA = prevRow?.ca_total_ht;

            const currentVol = row.volume_total || 0;
            const prevVol = prevRow?.volume_total;

            const trendCA = getTrend(currentCA, prevCA);
            const trendVol = getTrend(currentVol, prevVol);

            return {
                ...row,
                prev_ca: prevCA,
                trend_ca: trendCA,
                prev_vol: prevVol,
                trend_vol: trendVol,
            };
        });

        // 4. Build columns based on comparison mode
        const columns: TableColumn[] = [];

        // Main column (type, marque, reference, etc.)
        columns.push({
            key: matchKey,
            label: mainLabel,
            width: isComparing ? "w-[22%]" : "w-[40%]",
        });

        // CA column
        columns.push({
            key: "ca_total_ht",
            label: "CA",
            format: (v: number) => formatPrice(v),
            width: isComparing ? "w-[13%]" : "w-[30%]",
        });

        // Comparison CA columns
        if (isComparing) {
            columns.push({
                key: "prev_ca",
                label: "Préc. (CA)",
                format: (v: number) => (v !== undefined ? formatPrice(v) : "-"),
                width: "w-[13%]",
            });

            columns.push({
                key: "trend_ca",
                label: "Évol. (CA)",
                format: (v: number) => {
                    if (v === undefined || isNaN(v)) return "-";
                    const colorClass =
                        v > 0
                            ? "text-emerald-600"
                            : v < 0
                                ? "text-red-600"
                                : "text-muted-foreground";
                    return (
                        <span className={colorClass}>
                            {v > 0 ? "+" : ""}
                            {v.toFixed(1)}%
                        </span>
                    );
                },
                width: "w-[13%]",
            });
        }

        // Volume column
        columns.push({
            key: "volume_total",
            label: "Volume",
            format: (v: number) => formatWeight(v),
            width: isComparing ? "w-[13%]" : "w-[30%]",
        });

        // Comparison volume columns
        if (isComparing) {
            columns.push({
                key: "prev_vol",
                label: "Préc. (Vol)",
                format: (v: number) => (v !== undefined ? formatWeight(v) : "-"),
                width: "w-[13%]",
            });

            columns.push({
                key: "trend_vol",
                label: "Évol. (Vol)",
                format: (v: number) => {
                    if (v === undefined || isNaN(v)) return "-";
                    const colorClass =
                        v > 0
                            ? "text-emerald-600"
                            : v < 0
                                ? "text-red-600"
                                : "text-muted-foreground";
                    return (
                        <span className={colorClass}>
                            {v > 0 ? "+" : ""}
                            {v.toFixed(1)}%
                        </span>
                    );
                },
                width: "w-[13%]",
            });
        }

        return (
            <ProductCategorySection
                key={category}
                title={category}
                icon={icon}
                columns={columns}
                data={mergedData}
                variant={variant}
                clientId={clientId}
                onClientChange={onClientChange}
                filters={filters}
            />
        );
    });
}
