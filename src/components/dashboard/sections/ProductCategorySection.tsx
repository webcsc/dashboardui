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

interface ProductCategorySectionProps {
  title: string;
  titleModal?: string;
  icon?: ReactNode;
  columns: TableColumn[];
  data: Record<string, number | string>[];
  variant?: "cafe" | "equipement" | "service";
  compact?: boolean;
  clientId?: string;
  onClientChange?: (id: string) => void;
  filters?: FilterState;
  isLoading?: boolean;
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
  const { modalFilters } = useViewFilters(
    filters ||
      ({ period: { start: new Date(), end: new Date() } } as FilterState),
    modalClientId,
  );

  // Fetch products data for modal when it's open (only if filters provided)
  const {
    data: modalProductsResponse,
    isFetching: isFetchingProducts,
    error: productsError,
  } = useProducts(variant, modalFilters, { enabled: shouldFetchData });

  // Extract the category data from the response
  const modalData = useMemo(() => {
    // Handle 404 errors by returning empty array
    if (productsError) {
      console.warn(`Error fetching products for ${title}:`, productsError);
      return [];
    }

    if (!shouldFetchData || !modalProductsResponse?.products) return data;

    // The API returns { products: { "Category Name": { items } } }
    const categoryData = modalProductsResponse.products[title];
    if (!categoryData || Array.isArray(categoryData)) return data;

    // Transform the category data to match the expected format
    return Object.values(categoryData).map((item: Product) => ({
      ...item,
    }));
  }, [shouldFetchData, modalProductsResponse, title, data, productsError]);

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
        isLoading={isFetchingProducts && shouldFetchData}
      />
    </>
  );
}
