import { ReactNode } from "react";
import { ProductCategorySection } from "@/components/dashboard/sections/ProductCategorySection";
import { formatPrice, formatWeight } from "@/lib/formatters";
import type { TableColumn } from "@/types";
import type { ProductMap } from "@/types/products";
import { Bean, Coffee, Droplets, Package } from "lucide-react";

interface RenderProductViewOptions {
  products: Record<string, ProductMap> | null | undefined;
  compareProducts?: Record<string, ProductMap> | null | undefined;
  isComparing: boolean;
  getTrend: (current: number, previous: number | undefined) => number;
  variant: "cafe" | "equipement" | "service" | "thedivers";
  matchKey?: string;
  mainLabel?: string;
  clientId?: string;
  onClientChange?: (id: string) => void;
  filters?: import("@/types").FilterState;
}

export interface MergedProduct extends Record<
  string,
  string | number | undefined
> {
  prev_ca?: number;
  trend_ca?: number;
  prev_vol?: number;
  trend_vol?: number;
  prev_count?: number;
  trend_count?: number;
  part_ca?: number;
  prev_part_ca?: number;
  trend_part_ca?: number;
  [key: string]: string | number | undefined;
}

/**
 * Helper to merge current product data with comparison data
 */
export function mergeProductData(
  currentRows: any[],
  compareRows: any[],
  matchKey: string,
  getTrend: (current: number, previous: number | undefined) => number,
  secondaryKey: string = "volume_total",
): MergedProduct[] {
  const totalCA = currentRows.reduce(
    (sum, row) => sum + Number(row.ca_total_ht || 0),
    0,
  );
  const totalPrevCA = compareRows.reduce(
    (sum, row) => sum + Number(row.ca_total_ht || 0),
    0,
  );

  return currentRows.map((row) => {
    // Find matching row in previous period by matchKey
    const currentMatchValue = row[matchKey];

    const prevRow = compareRows.find((p) => {
      const prevMatchValue = p[matchKey];
      return prevMatchValue === currentMatchValue;
    });

    const currentCA = Number(row.ca_total_ht || 0);
    const prevCA =
      prevRow?.ca_total_ht !== undefined
        ? Number(prevRow.ca_total_ht)
        : undefined;

    const currentSec = Number(row[secondaryKey] || 0);
    const prevSec =
      prevRow?.[secondaryKey] !== undefined
        ? Number(prevRow[secondaryKey])
        : undefined;

    const trendCA = getTrend(currentCA, prevCA);
    const trendSec = getTrend(currentSec, prevSec);

    const partCA = totalCA > 0 ? (currentCA / totalCA) * 100 : 0;
    const prevPartCA =
      prevCA !== undefined && totalPrevCA > 0
        ? (prevCA / totalPrevCA) * 100
        : undefined;

    const result: MergedProduct = {
      ...row,
      prev_ca: prevCA,
      trend_ca: trendCA,
      part_ca: partCA,
      prev_part_ca: prevPartCA,
      trend_part_ca:
        partCA !== undefined && prevPartCA !== undefined
          ? partCA - prevPartCA
          : undefined,
    };

    if (secondaryKey === "volume_total") {
      result.prev_vol = prevSec;
      result.trend_vol = trendSec;
    } else if (secondaryKey === "count") {
      result.prev_count = prevSec;
      result.trend_count = trendSec;
    } else {
      // dynamic key fallback if needed, but for now we stick to refined types
      result[`prev_${secondaryKey}`] = prevSec;
      result[`trend_${secondaryKey}`] = trendSec;
    }

    return result;
  });
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
  matchKey = "type",
  mainLabel = "Type",
  clientId,
  onClientChange,
  filters,
}: RenderProductViewOptions): ReactNode {
  if (!products) return null;

  const iconList = {
    cafe: {
      "Café en Grains - M2L": <Bean className="h-5 w-5 text-universe-cafe" />,
      "Café Moulu": <Coffee className="h-5 w-5 text-universe-cafe" />,
      "Café Dosette": <Package className="h-5 w-5 text-universe-cafe" />,
      Thés: <Droplets className="h-5 w-5 text-universe-cafe" />,
      "Divers (Sucre, Chocolat, Gobelets...)": (
        <Package className="h-5 w-5 text-universe-cafe" />
      ),
    },
    equipement: {} as Record<string, ReactNode>,
    service: {} as Record<string, ReactNode>,
    thedivers: {
      Thés: <Droplets className="h-5 w-5 text-universe-thedivers" />,
      "Divers (Sucre, Chocolat, Gobelets...)": (
        <Package className="h-5 w-5 text-universe-thedivers" />
      ),
    },
  };

  return Object.entries(products).map(
    ([category, productList]: [string, ProductMap]) => {
      // 1. Get current rows
      const currentRows = Object.values(productList ?? {});

      if (!currentRows.length) return null;

      // 2. Get comparison rows (if any)
      const compareList = compareProducts?.[category];
      const compareRows = Array.isArray(compareList)
        ? compareList
        : Object.values(compareList ?? {});

      const secondaryKey =
        variant === "equipement" || variant === "service"
          ? "count"
          : variant === "thedivers"
            ? "quantity"
            : "volume_total";

      // 3. Merge data with comparison
      const mergedData = mergeProductData(
        currentRows,
        compareRows,
        matchKey,
        getTrend,
        secondaryKey,
      );

      // 4. Build columns based on comparison mode
      const columns: TableColumn[] = [];

      // Main column (type, marque, reference, etc.)
      columns.push({
        key: matchKey,
        label: mainLabel,
        width: isComparing ? "w-[20%]" : "w-[30%]",
      });

      // CA column
      columns.push({
        key: "ca_total_ht",
        label: "CA",
        format: (v: number) => formatPrice(v),
        width: isComparing ? "w-[12%]" : "w-[25%]",
      });

      // Part column
      columns.push({
        key: "part_ca",
        label: "Part",
        format: (v: number) => (v !== undefined ? `${v.toFixed(1)}%` : "-"),
        width: isComparing ? "w-[10%]" : "w-[15%]",
      });

      // Comparison CA columns
      if (isComparing) {
        columns.push({
          key: "prev_ca",
          label: "Préc. (CA)",
          format: (v: number) => (v !== undefined ? formatPrice(v) : "-"),
          width: "w-[12%]",
        });

        columns.push({
          key: "trend_ca",
          label: "Évol. (CA)",
          format: (v: number) => {
            if (v === undefined || Number.isNaN(v)) return "-";
            const colorClass =
              v > 0
                ? "text-emerald-600"
                : v < 0
                  ? "text-red-600"
                  : "text-muted-foreground";
            return (
              <span className={colorClass}>
                {v > 0 ? "+" : ""}
                {v.toFixed(2)}%
              </span>
            );
          },
          width: "w-[12%]",
        });

        columns.push({
          key: "trend_part_ca",
          label: "Évol. (Part)",
          format: (v: number) => {
            if (v === undefined || Number.isNaN(v)) return "-";
            const colorClass =
              v > 0
                ? "text-emerald-600"
                : v < 0
                  ? "text-red-600"
                  : "text-muted-foreground";
            return (
              <span className={colorClass}>
                {v > 0 ? "+" : ""}
                {v.toFixed(1)}pts
              </span>
            );
          },
          width: "w-[10%]",
        });
      }

      // Volume column
      const secondaryLabel = variant === "thedivers" ? "Unités" : "Volume";
      const secondaryFormat = (v: number) =>
        variant === "thedivers" ? v : formatWeight(v);

      columns.push({
        key: secondaryKey,
        label: secondaryLabel,
        format: secondaryFormat,
        width: isComparing ? "w-[12%]" : "w-[30%]",
      });

      // Comparison volume/units columns
      if (isComparing) {
        const secondaryPrevKey =
          secondaryKey === "volume_total"
            ? "prev_vol"
            : secondaryKey === "count"
              ? "prev_count"
              : `prev_${secondaryKey}`;

        const secondaryTrendKey =
          secondaryKey === "volume_total"
            ? "trend_vol"
            : secondaryKey === "count"
              ? "trend_count"
              : `trend_${secondaryKey}`;

        columns.push({
          key: secondaryPrevKey,
          label: `Préc. (${secondaryLabel})`,
          format: (v: number) => (v !== undefined ? secondaryFormat(v) : "-"),
          width: "w-[12%]",
        });

        columns.push({
          key: secondaryTrendKey,
          label: `Évol. (${secondaryLabel})`,
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
                {v.toFixed(2)}%
              </span>
            );
          },
          width: "w-[12%]",
        });
      }

      return (
        <ProductCategorySection
          key={category}
          title={category}
          icon={iconList[variant]?.[category]}
          columns={columns}
          data={mergedData}
          variant={variant}
          clientId={clientId}
          onClientChange={onClientChange}
          filters={filters}
          isComparing={isComparing}
        />
      );
    },
  );
}
