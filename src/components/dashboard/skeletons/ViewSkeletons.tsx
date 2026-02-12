import { KpiCardSkeleton, ChartSkeleton } from "./DashboardSkeletons";

export function RecapUniversSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-96 bg-muted rounded animate-pulse" />
            </div>

            {/* Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            {/* Univers cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            {/* Chart */}
            <ChartSkeleton height={400} />
        </div>
    );
}

export function RecapKpiSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-96 bg-muted rounded animate-pulse" />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton height={300} />
                <ChartSkeleton height={300} />
            </div>
        </div>
    );
}

export function UniverseViewSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton height={250} />
                <ChartSkeleton height={250} />
            </div>

            {/* Product sections */}
            <div className="space-y-4">
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                <div className="kpi-card h-48 bg-muted rounded animate-pulse" />
            </div>
        </div>
    );
}
