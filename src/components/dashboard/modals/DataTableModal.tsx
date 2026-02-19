import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientComboBox } from "@/components/ui/client-combobox";
import { TableColumn } from "@/types";

export interface CustomFilter {
  label: string;
  options: { value: string; label: string }[];
}

export interface DataTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  columns: TableColumn[];
  data: Record<string, number | string>[];
  variant?:
    | "default"
    | "gc"
    | "pp"
    | "b2c"
    | "cafe"
    | "equipement"
    | "service"
    | "thedivers";
  clientId?: string;
  onClientChange?: (id: string) => void;
  isLoading?: boolean;
  customFilters?: CustomFilter[];
  metadata?: Record<string, any>;
  onCustomFilterChange?: (
    filterValues: Record<string, string>,
    metadata?: Record<string, any>,
  ) => Record<string, number | string>[];
}

const variantStyles = {
  default: "border-primary/20",
  gc: "border-segment-gc/30",
  pp: "border-segment-pp/30",
  b2c: "border-segment-b2c/30",
  cafe: "border-universe-cafe/30",
  equipement: "border-universe-equipement/30",
  service: "border-universe-service/30",
  thedivers: "border-universe-thedivers/30",
};

const variantButtonStyles = {
  default: "bg-primary/10 hover:bg-primary/20 text-primary",
  gc: "bg-segment-gc/10 hover:bg-segment-gc/20 text-segment-gc",
  pp: "bg-segment-pp/10 hover:bg-segment-pp/20 text-segment-pp",
  b2c: "bg-segment-b2c/10 hover:bg-segment-b2c/20 text-segment-b2c",
  cafe: "bg-universe-cafe/10 hover:bg-universe-cafe/20 text-universe-cafe",
  equipement:
    "bg-universe-equipement/10 hover:bg-universe-equipement/20 text-universe-equipement",
  service:
    "bg-universe-service/10 hover:bg-universe-service/20 text-universe-service",
  thedivers:
    "bg-universe-thedivers/10 hover:bg-universe-thedivers/20 text-universe-thedivers",
};

export function DataTableModal({
  open,
  onOpenChange,
  title,
  columns,
  data,
  variant = "default",
  clientId,
  onClientChange,
  isLoading = false,
  customFilters = [],
  metadata = {},
  onCustomFilterChange,
}: DataTableModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [customFilterValues, setCustomFilterValues] = useState<
    Record<string, string>
  >({});
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for each filterable column
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    // French month abbreviations mapping
    const monthMapping: Record<string, number> = {
      jan: 0,
      janv: 0,
      janvier: 0,
      fév: 1,
      fev: 1,
      février: 1,
      fevrier: 1,
      mar: 2,
      mars: 2,
      avr: 3,
      avril: 3,
      mai: 4,
      juin: 5,
      juil: 6,
      juillet: 6,
      aoû: 7,
      aout: 7,
      août: 7,
      sep: 8,
      sept: 8,
      septembre: 8,
      oct: 9,
      octobre: 9,
      nov: 10,
      novembre: 10,
      déc: 11,
      dec: 11,
      décembre: 11,
      decembre: 11,
    };

    const getMonthValue = (val: string) => {
      if (!val) return -1;
      const lowerVal = val.toLowerCase();

      // Try to find year
      const yearMatch = lowerVal.match(/\d{4}/);
      const yearPart = yearMatch ? parseInt(yearMatch[0]) : 0;

      // Try to find month
      // Split by space or non-alphanumeric to separate "Avr 2025" -> ["Avr", "2025"]
      const parts = lowerVal.split(/[\s-]+/);

      let monthIndex = -1;

      for (const part of parts) {
        // Remove accents for easier matching if needed, but keys have accents
        // Check if part matches any key in mapping (prefix matching or exact)
        // We check keys that start with the part or vice versa?
        // Better: check if any key matches the part (at least 3 chars)
        if (part.length < 3) continue;

        const cleanPart = part.substring(0, 4); // compare first 3-4 chars

        // precise lookup first
        if (monthMapping[cleanPart] !== undefined) {
          monthIndex = monthMapping[cleanPart];
          break;
        }

        // try finding a key that starts with this part
        const foundKey = Object.keys(monthMapping).find(
          (k) => cleanPart.startsWith(k) || k.startsWith(cleanPart),
        );
        if (foundKey) {
          monthIndex = monthMapping[foundKey];
          break;
        }
      }

      if (monthIndex === -1) return -1; // Not a month
      return yearPart * 12 + monthIndex; // Year takes precedence
    };

    const isNumericColumn = (col: TableColumn, values: unknown[]) => {
      // Don't treat as numeric if it has a percentage format
      if (col.label.toLowerCase().includes("part") || col.label.includes("%")) {
        return "percentage";
      }

      // Check if values are mostly numbers
      const numericCount = values.filter(
        (v) => typeof v === "number" || !isNaN(Number(v)),
      ).length;
      const isNumeric = numericCount / values.length > 0.8;

      // Detect if it's currency, volume, or other numeric
      if (isNumeric) {
        if (
          col.label.toLowerCase().includes("ca") ||
          col.label.toLowerCase().includes("prix")
        ) {
          return "currency";
        }
        if (
          col.label.toLowerCase().includes("volume") ||
          col.label.toLowerCase().includes("kg")
        ) {
          return "weight";
        }
        return "number";
      }

      return false;
    };

    const createRanges = (values: number[], type: string) => {
      if (values.length === 0) return [];

      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;

      // If all values are the same or very close, don't create ranges
      if (range < 0.01) return [];

      // Percentage ranges
      if (type === "percentage") {
        const ranges = [];
        if (min < 25) ranges.push("< 25%");
        if (min < 50 && max >= 25) ranges.push("25% - 50%");
        if (min < 75 && max >= 50) ranges.push("50% - 75%");
        if (max >= 75) ranges.push("≥ 75%");
        return ranges;
      }

      // For other numeric types, create 4 ranges
      const step = range / 4;
      const ranges = [];

      for (let i = 0; i < 4; i++) {
        const rangeMin = min + step * i;
        const rangeMax = i === 3 ? max : min + step * (i + 1);

        let label = "";
        if (type === "currency") {
          label = `${(rangeMin / 1000).toFixed(0)}k - ${(rangeMax / 1000).toFixed(0)}k €`;
        } else if (type === "weight") {
          label = `${rangeMin.toFixed(0)} - ${rangeMax.toFixed(0)} kg`;
        } else {
          label = `${rangeMin.toFixed(0)} - ${rangeMax.toFixed(0)}`;
        }

        ranges.push(label);
      }

      return ranges;
    };

    columns.forEach((col) => {
      if (col.filterable === false) return;

      const uniqueValues = [...new Set(data.map((row) => row[col.key]))];

      // Check if it's a month column
      const isMonthColumn = uniqueValues.some(
        (v) => getMonthValue(String(v)) !== -1,
      );

      if (isMonthColumn) {
        options[col.key] = uniqueValues.map(String).sort((a, b) => {
          const valA = getMonthValue(a);
          const valB = getMonthValue(b);
          if (valA !== -1 && valB !== -1) {
            return valA - valB;
          }
          return a.localeCompare(b);
        });
      } else {
        // Check if numeric column
        const numericType = isNumericColumn(col, uniqueValues);

        if (numericType && uniqueValues.length >= 4) {
          // Create range filters for numeric columns with many values
          const numericValues = uniqueValues
            .map((v) => Number(v))
            .filter((v) => !isNaN(v));
          const ranges = createRanges(numericValues, numericType as string);

          if (ranges.length > 0) {
            options[col.key] = ranges;
          } else {
            // Fallback to exact values if ranges couldn't be created
            options[col.key] = uniqueValues.map(String).sort();
          }
        } else {
          // Use exact values for categorical columns
          options[col.key] = uniqueValues.map(String).sort();
        }
      }
    });

    return options;
  }, [columns, data]);

  // Apply custom filter transformation if provided
  const transformedData = useMemo(() => {
    if (onCustomFilterChange && Object.keys(customFilterValues).length > 0) {
      const hasActiveFilter = Object.values(customFilterValues).some(
        (v) => v && v !== "all",
      );
      if (hasActiveFilter) {
        return onCustomFilterChange(customFilterValues, metadata);
      }
    }
    return data;
  }, [data, customFilterValues, onCustomFilterChange, metadata]);

  // Filter data based on search and column filters
  const filteredData = useMemo(() => {
    const isValueInRange = (value: number, rangeLabel: string): boolean => {
      // Parse range labels like "3k - 6k €", "100 - 200 kg", "< 25%", "≥ 75%"

      // Handle percentage ranges
      if (rangeLabel.includes("%")) {
        const numValue = Number(value);
        if (rangeLabel.startsWith("< ")) {
          const threshold = parseFloat(
            rangeLabel.replace("< ", "").replace("%", ""),
          );
          return numValue < threshold;
        }
        if (rangeLabel.startsWith("≥ ")) {
          const threshold = parseFloat(
            rangeLabel.replace("≥ ", "").replace("%", ""),
          );
          return numValue >= threshold;
        }
        // Range like "25% - 50%"
        const parts = rangeLabel.split(" - ");
        if (parts.length === 2) {
          const min = parseFloat(parts[0].replace("%", ""));
          const max = parseFloat(parts[1].replace("%", ""));
          return numValue >= min && numValue < max;
        }
      }

      // Handle currency ranges like "3k - 6k €"
      if (rangeLabel.includes("€")) {
        const numValue = Number(value);
        const parts = rangeLabel.replace(" €", "").split(" - ");
        if (parts.length === 2) {
          const min = parseFloat(parts[0].replace("k", "")) * 1000;
          const max = parseFloat(parts[1].replace("k", "")) * 1000;
          return numValue >= min && numValue < max;
        }
      }

      // Handle weight/number ranges like "100 - 200 kg" or "100 - 200"
      const parts = rangeLabel.replace(" kg", "").split(" - ");
      if (parts.length === 2) {
        const numValue = Number(value);
        const min = parseFloat(parts[0]);
        const max = parseFloat(parts[1]);
        return numValue >= min && numValue <= max;
      }

      return false;
    };

    return transformedData.filter((row) => {
      // Global search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = columns.some((col) => {
          const value = row[col.key];
          return String(value).toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }

      // Column filters
      for (const [key, filterValue] of Object.entries(columnFilters)) {
        if (filterValue && filterValue !== "all") {
          const rowValue = row[key];

          // Try range matching first
          if (typeof rowValue === "number" || !isNaN(Number(rowValue))) {
            if (isValueInRange(Number(rowValue), filterValue)) {
              continue; // Match found, check next filter
            }
          }

          // Fallback to exact match
          if (String(rowValue) !== filterValue) {
            return false;
          }
        }
      }

      return true;
    });
  }, [transformedData, searchTerm, columnFilters, columns]);

  const activeFiltersCount =
    Object.values(columnFilters).filter((v) => v && v !== "all").length +
    Object.values(customFilterValues).filter((v) => v && v !== "all").length +
    (searchTerm ? 1 : 0) +
    (clientId ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm("");
    setColumnFilters({});
    setCustomFilterValues({});
    if (onClientChange) {
      onClientChange("");
    }
  };

  // Reset filters when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchTerm("");
      setColumnFilters({});
      setCustomFilterValues({});
      setShowFilters(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {/* Filter bar */}
        <div className="space-y-3 py-3 border-b border-border">
          <div className="flex justify-end items-center gap-2">
            {/* Client Filter */}
            {onClientChange && (
              <div className="mr-2">
                <ClientComboBox value={clientId} onChange={onClientChange} />
              </div>
            )}

            {/* Search input */}
            {/* <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans le tableau..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div> */}

            {/* Toggle filters button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "gap-1.5",
                showFilters && variantButtonStyles[variant],
              )}
            >
              <Filter className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                    variantButtonStyles[variant],
                  )}
                >
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Effacer
              </Button>
            )}
          </div>

          {/* Column filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {/* Custom filters first */}
              {customFilters.map((customFilter, index) => (
                <div key={`custom-${index}`} className="min-w-[140px]">
                  <Select
                    value={customFilterValues[customFilter.label] || "all"}
                    onValueChange={(value) =>
                      setCustomFilterValues((prev) => ({
                        ...prev,
                        [customFilter.label]: value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={customFilter.label} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">
                        Tous ({customFilter.label})
                      </SelectItem>
                      {customFilter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {/* Column filters */}
              {columns.map((col) => {
                const options = filterOptions[col.key];
                if (!options || options.length <= 1) return null;

                return (
                  <div key={col.key} className="min-w-[140px]">
                    <Select
                      value={columnFilters[col.key] || "all"}
                      onValueChange={(value) =>
                        setColumnFilters((prev) => ({
                          ...prev,
                          [col.key]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={col.label} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">Tous ({col.label})</SelectItem>
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="text-xs text-muted-foreground py-1">
          {filteredData.length} / {transformedData.length} résultats
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow className={variantStyles[variant]}>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="font-semibold text-center"
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className="text-center">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Aucun résultat trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    {columns.map((col) => (
                      <TableCell key={col.key} className="text-center">
                        {col.format
                          ? isNaN(Number(row[col.key]))
                            ? "-"
                            : col.format(Number(row[col.key]))
                          : String(row[col.key]) === "NaN"
                            ? "-"
                            : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
