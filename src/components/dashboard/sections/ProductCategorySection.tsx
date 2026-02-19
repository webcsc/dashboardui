import { useState, ReactNode, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableModal } from "../modals/DataTableModal";
import { TableColumn } from "@/types";
import { useProducts } from "@/hooks/useDashboardData";
import { useViewFilters } from "@/hooks";
import type { FilterState } from "@/types";
import type { Product } from "@/types/products";
import { mergeProductData } from "@/lib/product-view-helpers";
import { useComparisonHelpers } from "@/hooks";

interface ProductCategorySectionProps {
  title: string;
  titleModal?: string;
  icon?: ReactNode;
  columns: TableColumn[];
  data: Record<string, number | string>[];
  variant?: "cafe" | "equipement" | "service" | "thedivers";
  compact?: boolean;
  clientId?: string;
  onClientChange?: (id: string) => void;
  filters?: FilterState;
  isLoading?: boolean;
  modalDataPath?: string[];
  isComparing?: boolean;
}

const variantStyles = {
  cafe: {
    headerBg: "bg-universe-cafe-light",
    headerText: "text-universe-cafe",
    borderColor: "border-universe-cafe/20",
  },
  equipement: {
    headerBg: "bg-universe-equipement-light",
    headerText: "text-universe-equipement",
    borderColor: "border-universe-equipement/20",
  },
  service: {
    headerBg: "bg-universe-service-light",
    headerText: "text-universe-service",
    borderColor: "border-universe-service/20",
  },
  thedivers: {
    headerBg: "bg-universe-thedivers-light",
    headerText: "text-universe-thedivers",
    borderColor: "border-universe-thedivers/20",
  },
};

export function ProductCategorySection({
  title,
  titleModal,
  icon,
  columns,
  data,
  variant = "cafe",
  compact = false,
  clientId,
  onClientChange,
  filters,
  isComparing = false,
  modalDataPath,
}: ProductCategorySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalClientId, setModalClientId] = useState<string | undefined>(
    clientId,
  );
  const styles = variantStyles[variant];

  // Sync modal client filter with prop when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setModalClientId(clientId);
    }
  }, [isModalOpen, clientId]);

  // Only fetch data if filters are provided (for views with API support)
  const shouldFetchData = !!filters && isModalOpen;

  // Create modal filters with the modal client (provide default if not available)
  const { modalFilters, comparisonFilters } = useViewFilters(
    filters ||
      ({ period: { start: new Date(), end: new Date() } } as FilterState),
    modalClientId,
  );

  // We need specific comparison filters for the modal (using modalClientId)
  const modalComparisonFilters = useMemo(
    () => ({
      ...comparisonFilters,
      clientId: modalClientId,
    }),
    [comparisonFilters, modalClientId],
  );

  // Fetch products data for modal when it's open (only if filters provided)
  const {
    data: modalProductsResponse,
    isFetching: isFetchingProducts,
    error: productsError,
  } = useProducts(variant, modalFilters, { enabled: shouldFetchData });

  // Fetch comparison data if needed
  const {
    data: modalCompareProductsResponse,
    isFetching: isFetchingCompareProducts,
  } = useProducts(variant, modalComparisonFilters, {
    enabled: shouldFetchData && isComparing,
  });

  const { getTrend } = useComparisonHelpers(isComparing);

  // Helper to extract data using a path (e.g., ["Location Machines", "Par Marque"])
  const extractDataFromPath = (response: any, path?: string[]) => {
    if (!response?.products) return null;
    if (!path || path.length === 0) return response.products[title];

    let current = response.products;
    for (const key of path) {
      if (current && typeof current === "object") {
        current = (current as Record<string, any>)[key];
      } else {
        return null;
      }
    }
    return current;
  };

  // Extract the category data from the response
  const modalData = useMemo(() => {
    // Handle 404 errors by returning empty array
    if (productsError) {
      console.warn(`Error fetching products for ${title}:`, productsError);
      return [];
    }

    if (!shouldFetchData || !modalProductsResponse?.products) return data;

    // Use path if provided, otherwise fallback to title
    const categoryData = modalDataPath
      ? extractDataFromPath(modalProductsResponse, modalDataPath)
      : modalProductsResponse.products[title];

    if (!categoryData || Array.isArray(categoryData)) {
      // If we found nothing via path, or it returned an array (should be object map for products?)
      // Wait, standard products endpoint returns { products: { Category: { Item1: ..., Item2: ... } } }
      // So categoryData should be the map of items.
      // If it's an array, it might be the items list directly?
      // Let's assume consistent object map for now, or validation.
      // If data is missing in modal response (e.g. filtered out), return empty or keep original data?
      // Usually we want the filtered data. If empty, it means 0 results.
      if (!categoryData) return []; // Empty if not found in filtered response
    }

    // Get comparison data for this category
    const compareCategoryData =
      isComparing && modalCompareProductsResponse?.products
        ? modalDataPath
          ? extractDataFromPath(modalCompareProductsResponse, modalDataPath)
          : modalCompareProductsResponse.products[title]
        : {};

    const currentRows = categoryData ? Object.values(categoryData) : [];
    const compareRows = compareCategoryData
      ? Object.values(compareCategoryData)
      : [];

    if (isComparing) {
      // Use the helper we extracted to merge data
      let matchKey = "type"; // default for cafe
      if (variant === "equipement") matchKey = "type"; // Equipement rows usually have 'type' or 'marque' as key, but helper adds 'type' key
      if (variant === "service") matchKey = "type_intervention";

      // Heuristic for matchKey if not explicit
      if (currentRows.length > 0) {
        const firstRow = currentRows[0];
        if (firstRow && typeof firstRow === "object" && "type" in firstRow) {
          matchKey = "type";
        }
        // For equipement, the rows might have 'marque' or 'type' depending on subcategory
        // But the API response objects usually have the key as the ID.
        // Wait, Object.values() loses the key.
        // In `renderEquipementProductView`, we map `Object.entries` to inject `type: productName`.
        // BUT here we are reading raw API response which DOES NOT have `type` injected yet (unless API provides it).
        // `mergeProductData` in `equipement-product-view-helpers` manually injects `type`.
        // We need to do the same here if the raw API data doesn't have it.
        // The raw API data for Equipement is `EquipementProduct { ca_total_ht, count }`. It lacks the name/type.
        // The name is the KEY in the object map.
      }

      // If we are reading raw API object map, we need to preserve keys as 'type'
      const normalizeRawData = (dataMap: any) => {
        if (!dataMap) return [];
        return Object.entries(dataMap).map(([key, val]: [string, any]) => ({
          ...val,
          type: key, // Inject key as type/name for matching
          // If the data already has a name field, we might prefer that, but 'type' is used in equipement helper
        }));
      };

      const normalizedCurrent = normalizeRawData(categoryData);
      const normalizedCompare = normalizeRawData(compareCategoryData);

      const secondaryKey =
        variant === "equipement" || variant === "service"
          ? "count"
          : variant === "thedivers"
            ? "quantity"
            : "volume_total";

      return mergeProductData(
        normalizedCurrent,
        normalizedCompare,
        "type", // keys became 'type'
        getTrend,
        secondaryKey,
      );
    }

    // Transform the category data to match the expected format (injecting keys if needed)
    if (categoryData) {
      const rows = Object.entries(categoryData).map(
        ([key, item]: [string, any]) => ({
          ...item,
          type: key, // Ensure we have the key available as type/name
        }),
      );

      const totalCA = rows.reduce(
        (sum, item) => sum + Number(item.ca_total_ht || 0),
        0,
      );

      return rows.map((item) => ({
        ...item,
        part_ca:
          totalCA > 0 ? (Number(item.ca_total_ht || 0) / totalCA) * 100 : 0,
      }));
    }

    return data;
  }, [
    shouldFetchData,
    modalProductsResponse,
    modalCompareProductsResponse,
    title,
    data,
    productsError,
    isComparing,
    getTrend,
    variant,
    modalDataPath,
  ]);

  const handleClientChange = (newClientId: string) => {
    setModalClientId(newClientId);
    if (onClientChange) {
      onClientChange(newClientId);
    }
  };

  const displayData = compact ? data.slice(0, 4) : data;
  const hasMore = compact && data.length > 4;

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-card overflow-hidden cursor-pointer hover:shadow-lg transition-all",
          styles.borderColor,
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <div
          className={cn(
            "px-4 py-3 flex items-center justify-between",
            styles.headerBg,
          )}
        >
          <div className="flex items-center gap-2">
            {icon}
            <h4 className={cn("font-semibold", styles.headerText)}>{title}</h4>
          </div>
          <span className="text-xs text-muted-foreground underline">
            {hasMore ? `Voir tout (${data.length})` : "Voir détails"}
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn("text-xs text-center", col.width)}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn("text-sm py-2 text-center", col.width)}
                  >
                    {(() => {
                      const val = row[col.key];
                      if (
                        val === undefined ||
                        val === null ||
                        (typeof val === "number" && isNaN(val))
                      ) {
                        return "-";
                      }
                      const formatted = col.format
                        ? col.format(Number(val))
                        : val;
                      if (
                        typeof formatted === "string" &&
                        (formatted.includes("NaN") ||
                          formatted.includes("undefined"))
                      ) {
                        return "-";
                      }
                      return formatted;
                    })()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DataTableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={titleModal || title}
        columns={columns}
        data={modalData}
        variant={variant}
        clientId={modalClientId}
        onClientChange={handleClientChange}
        isLoading={
          (isFetchingProducts || isFetchingCompareProducts) && shouldFetchData
        }
      />
    </>
  );
}
