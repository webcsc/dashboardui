import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DataTableModal } from "../modals/DataTableModal";
import { TableColumn } from "@/types";

interface ClickableChartProps {
  title: string;
  currentData: { name: string; value: number }[];
  previousData?: { name: string; value: number }[];
  showComparison?: boolean;
  currentLabel?: string;
  previousLabel?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  variant?: "default" | "gc" | "pp" | "b2c";
  isLoading?: boolean; // Loading state for table modal
}

export function ClickableChart({
  title,
  currentData,
  previousData,
  showComparison = false,
  currentLabel = "Période actuelle",
  previousLabel = "Période précédente",
  valuePrefix = "",
  valueSuffix = "",
  variant = "default",
  isLoading = false,
}: ClickableChartProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Merge data for comparison
  const mergedData = currentData.map((item, index) => ({
    name: item.name,
    current: item.value,
    previous: previousData?.[index]?.value ?? 0,
  }));

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${valuePrefix}${(value / 1000000).toFixed(1)}M${valueSuffix}`;
    }
    if (value >= 1000) {
      return `${valuePrefix}${(value / 1000).toFixed(0)}k${valueSuffix}`;
    }
    return `${valuePrefix}${value}${valueSuffix}`;
  };

  // Generate table data from chart data
  const tableColumns: TableColumn[] = [
    { key: "name", label: "Période" },
    { key: "current", label: currentLabel, format: (v) => formatValue(v) },
    ...(showComparison && previousData
      ? [{ key: "previous", label: previousLabel, format: (v: number) => formatValue(v) }]
      : []),
    ...(showComparison && previousData
      ? [
        {
          key: "variation",
          label: "Variation",
          format: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`,
        },
      ]
      : []),
  ];

  const tableData = mergedData.map((item) => ({
    ...item,
    variation: item.previous ? ((item.current - item.previous) / item.previous) * 100 : 0,
  }));

  return (
    <>
      <div
        className="kpi-card cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-xs text-muted-foreground underline">Voir tableau</span>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedData}>
              <defs>
                <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number, name: string) => [
                  formatValue(value),
                  name === "current" ? currentLabel : previousLabel,
                ]}
              />
              {showComparison && (
                <Legend
                  formatter={(value) => (value === "current" ? currentLabel : previousLabel)}
                />
              )}
              {showComparison && previousData && (
                <Area
                  type="monotone"
                  dataKey="previous"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#previousGradient)"
                />
              )}
              <Area
                type="monotone"
                dataKey="current"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#currentGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={title}
        columns={tableColumns}
        data={tableData}
        variant={variant}
        isLoading={isLoading}
      />
    </>
  );
}



