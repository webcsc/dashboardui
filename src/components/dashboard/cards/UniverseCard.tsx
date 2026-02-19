import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiRowProps {
  label: string;
  value: string;
  compareValue?: string;
  showComparison?: boolean;
}

function KpiRow({ label, value, compareValue, showComparison }: KpiRowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        {showComparison && compareValue && (
          <span className="text-xs text-muted-foreground">{compareValue}</span>
        )}
      </div>
    </div>
  );
}

interface UniverseCardProps {
  title: string;
  icon: ReactNode;
  borderColorClass: string;
  iconColorClass: string;
  rows: {
    label: string;
    value: string;
    compareValue?: string;
    showComparison?: boolean;
  }[];
}

export function UniverseCard({
  title,
  icon,
  borderColorClass,
  iconColorClass,
  rows,
}: UniverseCardProps) {
  return (
    <div className={cn("kpi-card border-l-4", borderColorClass)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={iconColorClass}>{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <KpiRow
            key={index}
            label={row.label}
            value={row.value}
            compareValue={row.compareValue}
            showComparison={row.showComparison}
          />
        ))}
      </div>
    </div>
  );
}
