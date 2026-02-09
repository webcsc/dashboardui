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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
  filterable?: boolean;
  filterType?: "text" | "select";
}

export interface DataTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  columns: TableColumn[];
  data: Record<string, any>[];
  variant?: "default" | "gc" | "pp" | "b2c" | "cafe" | "equipement" | "service";
}

const variantStyles = {
  default: "border-primary/20",
  gc: "border-segment-gc/30",
  pp: "border-segment-pp/30",
  b2c: "border-segment-b2c/30",
  cafe: "border-universe-cafe/30",
  equipement: "border-universe-equipement/30",
  service: "border-universe-service/30",
};

const variantButtonStyles = {
  default: "bg-primary/10 hover:bg-primary/20 text-primary",
  gc: "bg-segment-gc/10 hover:bg-segment-gc/20 text-segment-gc",
  pp: "bg-segment-pp/10 hover:bg-segment-pp/20 text-segment-pp",
  b2c: "bg-segment-b2c/10 hover:bg-segment-b2c/20 text-segment-b2c",
  cafe: "bg-universe-cafe/10 hover:bg-universe-cafe/20 text-universe-cafe",
  equipement: "bg-universe-equipement/10 hover:bg-universe-equipement/20 text-universe-equipement",
  service: "bg-universe-service/10 hover:bg-universe-service/20 text-universe-service",
};

export function DataTableModal({
  open,
  onOpenChange,
  title,
  columns,
  data,
  variant = "default",
}: DataTableModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for each filterable column
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filterable !== false) {
        const uniqueValues = [...new Set(data.map((row) => String(row[col.key])))];
        options[col.key] = uniqueValues.sort();
      }
    });
    return options;
  }, [columns, data]);

  // Filter data based on search and column filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
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
          if (String(row[key]) !== filterValue) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, columnFilters, columns]);

  const activeFiltersCount = Object.values(columnFilters).filter(
    (v) => v && v !== "all"
  ).length + (searchTerm ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm("");
    setColumnFilters({});
  };

  // Reset filters when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchTerm("");
      setColumnFilters({});
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
          <div className="flex items-center gap-2">
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
                showFilters && variantButtonStyles[variant]
              )}
            >
              <Filter className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                  variantButtonStyles[variant]
                )}>
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
                        <SelectItem value="all">
                          Tous ({col.label})
                        </SelectItem>
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
          {filteredData.length} / {data.length} résultats
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow className={variantStyles[variant]}>
                {columns.map((col) => (
                  <TableHead key={col.key} className="font-semibold">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
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
                      <TableCell key={col.key}>
                        {col.format ? col.format(row[col.key]) : row[col.key]}
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



