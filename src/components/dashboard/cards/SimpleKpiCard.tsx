import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableModal, TableColumn } from "../modals/DataTableModal";

interface SimpleKpiCardProps {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: "default" | "gc" | "pp" | "b2c";
  className?: string;
  tableTitle?: string;
  tableColumns?: TableColumn[];
  tableData?: Record<string, any>[];
}

export function SimpleKpiCard({
  label,
  value,
  trend,
  trendLabel = "vs mois dernier",
  icon,
  variant = "default",
  className,
  tableTitle,
  tableColumns = [],
  tableData = [],
}: SimpleKpiCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="h-4 w-4" />;
    return trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTrendClass = () => {
    if (trend === undefined || trend === 0) return "text-muted-foreground";
    return trend > 0 ? "kpi-trend-up" : "kpi-trend-down";
  };

  const getAccentClass = () => {
    switch (variant) {
      case "gc":
        return "border-l-4 border-l-segment-gc";
      case "pp":
        return "border-l-4 border-l-segment-pp";
      case "b2c":
        return "border-l-4 border-l-segment-b2c";
      default:
        return "";
    }
  };

  const hasTableData = tableColumns.length > 0 && tableData.length > 0;

  return (
    <>
      <div
        className={cn(
          "kpi-card animate-fade-in",
          getAccentClass(),
          hasTableData && "cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all",
          className
        )}
        onClick={() => hasTableData && setIsModalOpen(true)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="kpi-label">{label}</p>
            <p className="kpi-value">{value}</p>
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-secondary/50">{icon}</div>
          )}
        </div>
        {trend !== undefined && (
          <div className={cn("mt-3 flex items-center gap-1", getTrendClass())}>
            {getTrendIcon()}
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
            <span className="text-muted-foreground ml-1">{trendLabel}</span>
          </div>
        )}
        {hasTableData && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <span className="underline">Voir les données</span>
          </div>
        )}
      </div>

      <DataTableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={tableTitle || label}
        columns={tableColumns}
        data={tableData}
        variant={variant}
      />
    </>
  );
}



