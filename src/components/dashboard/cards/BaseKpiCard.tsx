import { useState, ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableModal } from "../modals/DataTableModal";
import { TableColumn } from "@/types";

interface BaseKpiCardProps {
  label: string;
  value: string;
  previousValue?: string;
  trend?: number;
  icon?: ReactNode;
  variant?:
    | "default"
    | "gc"
    | "pp"
    | "b2c"
    | "cafe"
    | "equipement"
    | "service"
    | "thedivers";
  showComparison?: boolean;
  tableTitle?: string;
  tableColumns?: TableColumn[];
  tableData?: Record<string, number | string>[];
  onClick?: () => void; // Support for external modal management
  isLoading?: boolean; // Loading state for table modal
}

export function BaseKpiCard({
  label,
  value,
  previousValue,
  trend,
  icon,
  variant = "default",
  showComparison = false,
  tableTitle,
  tableColumns = [],
  tableData = [],
  onClick,
  isLoading = false,
}: BaseKpiCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayValue = value.includes("NaN") ? "-" : value;
  const displayPreviousValue = previousValue?.includes("NaN")
    ? "-"
    : previousValue;

  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;
  const isNeutral = !trend || trend === 0;

  const variantStyles = {
    default: "",
    gc: "border-l-4 border-l-segment-gc",
    pp: "border-l-4 border-l-segment-pp",
    b2c: "border-l-4 border-l-segment-b2c",
    cafe: "border-l-4 border-l-universe-cafe",
    equipement: "border-l-4 border-l-universe-equipement",
    service: "border-l-4 border-l-universe-service",
    thedivers: "border-l-4 border-l-universe-thedivers",
  };

  const hasTableData = tableColumns.length > 0 && tableData.length > 0;
  const isClickable = hasTableData || onClick;

  return (
    <>
      <div
        className={cn(
          "kpi-card group transition-all relative",
          variantStyles[variant],
          isClickable &&
            "cursor-pointer hover:shadow-lg hover:border-primary/30",
        )}
        onClick={() => {
          if (onClick) {
            onClick();
          } else if (hasTableData) {
            setIsModalOpen(true);
          }
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-12">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {label}
            </p>

            {showComparison && previousValue ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Actuel
                    </span>
                    <span className="text-2xl font-bold text-foreground text-nowrap">
                      {displayValue}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Précédent
                    </span>
                    <span className="text-lg font-semibold text-muted-foreground text-nowrap">
                      {displayPreviousValue}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-2xl font-bold text-foreground animate-count-up">
                {displayValue}
              </p>
            )}
          </div>

          {icon && (
            <div className="absolute top-2 right-3 p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              {icon}
            </div>
          )}
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 mt-3 text-sm font-medium",
              isPositive && "text-green-600 dark:text-green-400",
              isNegative && "text-red-600 dark:text-red-400",
              isNeutral && "text-muted-foreground",
            )}
          >
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            {isNeutral && <Minus className="h-4 w-4" />}
            <span>
              {isNaN(trend)
                ? "-"
                : `${isPositive ? "+" : ""}${trend.toFixed(2)}%`}
            </span>
            <span className="text-muted-foreground font-normal ml-1">
              {showComparison ? "vs période précédente" : "vs mois dernier"}
            </span>
          </div>
        )}

        {isClickable && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <span className="underline">Voir les données</span>
          </div>
        )}
      </div>

      {hasTableData && (
        <DataTableModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          title={tableTitle || label}
          columns={tableColumns}
          data={tableData}
          variant={variant}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
