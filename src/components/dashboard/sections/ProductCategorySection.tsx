import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableModal } from "../modals/DataTableModal";

interface TableColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

interface ProductCategorySectionProps {
  title: string;
  icon?: ReactNode;
  columns: TableColumn[];
  data: Record<string, any>[];
  variant?: "cafe" | "equipement" | "service";
  compact?: boolean;
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
  icon,
  columns,
  data,
  variant = "cafe",
  compact = false,
}: ProductCategorySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const styles = variantStyles[variant];

  const displayData = compact ? data.slice(0, 4) : data;
  const hasMore = compact && data.length > 4;

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-card overflow-hidden cursor-pointer hover:shadow-lg transition-all",
          styles.borderColor
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={cn("px-4 py-3 flex items-center justify-between", styles.headerBg)}>
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
                <TableHead key={col.key} className="text-xs">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-sm py-2">
                    {col.format ? col.format(row[col.key]) : row[col.key]}
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
        title={title}
        columns={columns}
        data={data}
        variant={variant}
      />
    </>
  );
}



