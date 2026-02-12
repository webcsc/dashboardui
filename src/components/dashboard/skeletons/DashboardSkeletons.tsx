import { Skeleton } from "@/components/ui/skeleton";

export function KpiCardSkeleton() {
    return (
        <div className="kpi-card">
            <div className="space-y-3">
                {/* Label */}
                <Skeleton className="h-4 w-32" />

                {/* Value */}
                <Skeleton className="h-8 w-24" />

                {/* Icon placeholder */}
                <Skeleton className="absolute top-4 right-4 h-5 w-5 rounded-full" />
            </div>
        </div>
    );
}

export function ChartSkeleton({ height = 400 }: { height?: number }) {
    return (
        <div className="chart-container">
            <div className="space-y-4">
                {/* Chart title */}
                <Skeleton className="h-6 w-48" />

                {/* Chart area */}
                <Skeleton className="w-full rounded-lg" style={{ height: `${height}px` }} />
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="kpi-card">
            <div className="space-y-3">
                {/* Table header */}
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Table rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ProductSectionSkeleton() {
    return (
        <div className="kpi-card">
            <div className="space-y-4">
                {/* Section header */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                </div>

                {/* Table */}
                <TableSkeleton rows={3} />
            </div>
        </div>
    );
}
