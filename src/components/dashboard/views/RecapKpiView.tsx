import { BaseKpiCard } from "../cards/BaseKpiCard";
import { RecapKpiSkeleton } from "../skeletons";
import { Euro, Building2, Zap, TrendingUp } from "lucide-react";
import type { FilterState } from "@/types";
import { useMemo } from "react";
import { DataTableModal } from "../modals/DataTableModal";
import { TableColumn } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  fetchKpiStrategiqueSummary,
  KpiStrategiqueSummaryResponse,
  KpiStrategiqueGrandsComptes,
  KpiStrategiqueArrEvolutionItem,
  KpiStrategiqueAdoptionParClient,
  KpiStrategiquePlugPlay,
  KpiStrategiqueMrrEvolutionItem,
} from "@/services/dashboard-api";
import { CACHE_TIME } from "@/config/constants";
import { useComparisonHelpers, useViewFilters } from "@/hooks";
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
  ReferenceArea,
} from "recharts";
import { format, subMonths } from "date-fns";
import { getMonthDuration } from "@/lib";
import { MONTH_ORDER, FRENCH_MONTHS } from "@/lib/dashboard-constants";

interface RecapKpiViewProps {
  filters: FilterState;
  isComparing: boolean;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

function useKpiStrategique(
  filters: FilterState,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["kpistrategique-summary", filters],
    queryFn: () => fetchKpiStrategiqueSummary(filters),
    staleTime: CACHE_TIME.STALE_TIME,
    gcTime: CACHE_TIME.CACHE_TIME,
    retry: 3,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
    placeholderData: (p) => p,
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEur(value: number, unit: "k" | "M" = "k"): string {
  if (unit === "M") return `${(value / 1_000_000).toFixed(2)}M€`;
  return `${(value / 1_000).toFixed(0)}k€`;
}

// ─── Normalization helpers (gère les 2 formes de réponse API) ─────────────────

/** Nombre de clients GC : forme imbriquée (.clients.count) ou plate (.nombre_clients_end) */
function gcClientCount(gc?: KpiStrategiqueGrandsComptes): number {
  return gc?.clients?.count ?? gc?.nombre_clients_end ?? 0;
}

/** ARR evolution GC : forme imbriquée (.arr.evolution) ou plate (.evolution_arr vide) */
function gcArrEvolution(
  gc?: KpiStrategiqueGrandsComptes,
): KpiStrategiqueArrEvolutionItem[] {
  return gc?.arr?.evolution ?? [];
}

/** Adoption par client GC : forme imbriquée ou plate */
function gcAdoptionList(
  gc?: KpiStrategiqueGrandsComptes,
): KpiStrategiqueAdoptionParClient[] {
  return gc?.adoption_interne?.par_client ?? [];
}

/** Nombre de clients PP : forme imbriquée (.clients.count) ou plate (.nombre_abonnements_end) */
function ppClientCount(pp?: KpiStrategiquePlugPlay): number {
  return pp?.clients?.count ?? pp?.nombre_abonnements_end ?? 0;
}

/** MRR evolution PP : forme imbriquée (.mrr.evolution) ou plate (.evolution_mrr vide) */
function ppMrrEvolution(
  pp?: KpiStrategiquePlugPlay,
): KpiStrategiqueMrrEvolutionItem[] {
  return pp?.mrr?.evolution ?? [];
}

/** Churn 90j PP : forme imbriquée (.churn_90j.valeur) ou plate (.churn_90_jours) */
function ppChurn90j(pp?: KpiStrategiquePlugPlay): number {
  return pp?.churn_90j?.valeur ?? pp?.churn_90_jours ?? 0;
}

/**
 * ARPA PP : forme imbriquée (.arpa ist { valeur }) ou plate (.arpa est un number)
 * Retourne la valeur en euros
 */
function ppArpaValue(pp?: KpiStrategiquePlugPlay): number {
  if (!pp?.arpa) return 0;
  if (typeof pp.arpa === "number") return pp.arpa;
  return pp.arpa.valeur ?? 0;
}

/** Abonnements actifs PP : forme imbriquée (.abonnements.nombre_actif) ou plate */
function ppAbonnementsActif(pp?: KpiStrategiquePlugPlay): number {
  return pp?.abonnements?.nombre_actif ?? pp?.nombre_abonnements_end ?? 0;
}

/** Build chart-ready evolution array from GC ARR + PP MRR data */
function buildEvolutionChart(data: KpiStrategiqueSummaryResponse) {
  const gcEvol = gcArrEvolution(data?.overview?.grands_comptes);
  const ppEvol = ppMrrEvolution(data?.overview?.plug_and_play);

  // Index PP MRR by month name (case-insensitive) for easy join
  const mrrByMonth: Record<string, number> = {};
  ppEvol.forEach((item) => {
    mrrByMonth[item.mois.toLowerCase()] = item.mrr;
  });

  return gcEvol.map((item) => {
    const monthKey = item.month.toLowerCase();
    const gcArr = item.arr ?? 0;
    const ppMrr = mrrByMonth[monthKey] ?? 0;
    return {
      mois: item.month.substring(0, 3),
      gc: gcArr,
      pp: ppMrr,
      total: gcArr + ppMrr,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecapKpiView({ filters, isComparing }: RecapKpiViewProps) {
  const [segmentModal, setSegmentModal] = useState<"gc" | "pp" | null>(null);

  // Derive comparison filters from global filters via hook
  const { comparisonFilters } = useViewFilters(filters, undefined);
  const { getTrend, getPreviousCurrencyValue, getPreviousValue } =
    useComparisonHelpers(isComparing);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const { data: current, isLoading, isFetching } = useKpiStrategique(filters);
  const { data: compare } = useKpiStrategique(comparisonFilters, {
    enabled: isComparing && !!filters.comparePeriod,
  });

  // Fetch 12-month rolling window data OR full period if > 12 months for the chart
  const trendFilters = useMemo(() => {
    if (!filters.period.start || !filters.period.end) return filters;
    const duration = getMonthDuration(filters.period.start, filters.period.end);
    if (duration > 12) return filters;
    const end = new Date(filters.period.end);
    const start = subMonths(end, 11);
    start.setDate(1);
    return { ...filters, period: { start, end } };
  }, [filters]);

  const trendComparisonFilters = useMemo(() => {
    if (!comparisonFilters?.period?.start || !comparisonFilters?.period?.end)
      return null;
    const duration = getMonthDuration(
      comparisonFilters.period.start,
      comparisonFilters.period.end,
    );
    if (duration > 12) return comparisonFilters;
    const end = new Date(comparisonFilters.period.end);
    const start = subMonths(end, 11);
    start.setDate(1);
    return { ...comparisonFilters, period: { start, end } };
  }, [comparisonFilters]);

  const {
    data: trendCurrent,
    isLoading: isLoadingTrend,
    isFetching: isFetchingTrend,
  } = useKpiStrategique(trendFilters);
  const { data: trendCompare } = useKpiStrategique(
    trendComparisonFilters as FilterState,
    {
      enabled: isComparing && !!trendComparisonFilters,
    },
  );

  // ── Derivations ──────────────────────────────────────────────────────────────
  const gc = current?.overview?.grands_comptes;
  const pp = current?.overview?.plug_and_play;
  const gcCompare = compare?.overview?.grands_comptes;
  const ppCompare = compare?.overview?.plug_and_play;

  const gcClients = gcClientCount(gc);
  const ppClients = ppClientCount(pp);
  const mrrTotal = current?.overview?.mrr_total_recurrent ?? 0;
  const arrTotal = current?.overview?.arr_total_recurrent ?? 0;

  const gcClientsPrev = isComparing ? gcClientCount(gcCompare) : undefined;
  const ppClientsPrev = isComparing ? ppClientCount(ppCompare) : undefined;
  const mrrTotalPrev = compare?.overview?.mrr_total_recurrent;
  const arrTotalPrev = compare?.overview?.arr_total_recurrent;

  // GC details
  const gcArrEvol = gcArrEvolution(gc);
  const gcArr =
    [...gcArrEvol].reverse().find((e) => e.arr > 0)?.arr ??
    gcArrEvol.slice(-1)[0]?.arr ??
    0;
  const gcArrPrev = [...gcArrEvolution(gcCompare)]
    .reverse()
    .find((e) => e.arr > 0)?.arr;
  const gcMarge = gc?.marge_client?.details ?? [];

  // PP details
  const ppMrrEvol = ppMrrEvolution(pp);
  const ppMrr =
    [...ppMrrEvol].reverse().find((e) => e.mrr > 0)?.mrr ??
    ppMrrEvol.slice(-1)[0]?.mrr ??
    0;
  const ppMrrPrev = [...ppMrrEvolution(ppCompare)]
    .reverse()
    .find((e) => e.mrr > 0)?.mrr;
  const ppChurn = ppChurn90j(pp);
  const ppChurnPrev = isComparing ? ppChurn90j(ppCompare) : undefined;
  const ppArpa = ppArpaValue(pp);
  const ppAbonnements = ppAbonnementsActif(pp);

  // Evolution chart data with rolling year and inactive ranges
  const evolutionChartData = useMemo(() => {
    if (!trendCurrent) return [];

    const gcEvol = gcArrEvolution(trendCurrent?.overview?.grands_comptes);
    const ppEvol = ppMrrEvolution(trendCurrent?.overview?.plug_and_play);

    const gcPrevEvol =
      isComparing && trendCompare
        ? gcArrEvolution(trendCompare?.overview?.grands_comptes)
        : [];
    const ppPrevEvol =
      isComparing && trendCompare
        ? ppMrrEvolution(trendCompare?.overview?.plug_and_play)
        : [];

    // Index by month name
    const mrrByMonth: Record<string, number> = {};
    ppEvol.forEach((item) => {
      mrrByMonth[item.mois.toLowerCase()] = item.mrr;
    });

    const prevGcByMonth: Record<string, number> = {};
    gcPrevEvol.forEach((item) => {
      prevGcByMonth[item.month.toLowerCase()] = item.arr;
    });

    const prevMrrByMonth: Record<string, number> = {};
    ppPrevEvol.forEach((item) => {
      prevMrrByMonth[item.mois.toLowerCase()] = item.mrr;
    });

    const start = trendFilters.period.start;
    const end = trendFilters.period.end;

    // To identify `actif` we need actual dates matching sequence
    const periodKeys: { monthName: string; monthIndex: number; date: Date }[] =
      [];
    const currentIter = new Date(start);
    currentIter.setDate(1);
    while (currentIter <= end) {
      periodKeys.push({
        monthName: MONTH_ORDER[currentIter.getMonth()],
        monthIndex: currentIter.getMonth(),
        date: new Date(currentIter),
      });
      currentIter.setMonth(currentIter.getMonth() + 1);
    }

    return gcEvol.map((item, index) => {
      const monthKey = item.month.toLowerCase();
      const gcArr = item.arr ?? 0;
      const ppMrr = mrrByMonth[monthKey] ?? 0;

      const gcPrev = prevGcByMonth[monthKey] ?? 0;
      const ppPrev = prevMrrByMonth[monthKey] ?? 0;

      const dateObj = periodKeys[index]?.date || new Date();
      const checkDate = new Date(dateObj);
      checkDate.setHours(12, 0, 0, 0);
      const userStart = new Date(filters.period.start);
      userStart.setHours(0, 0, 0, 0);
      const userEnd = new Date(filters.period.end);
      userEnd.setHours(23, 59, 59, 999);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const isWithinSelection = checkDate >= userStart && checkDate <= userEnd;
      const isPastOrCurrent = checkDate <= today;
      const isActive = isWithinSelection && isPastOrCurrent;

      return {
        mois: item.month.substring(0, 3),
        gc: gcArr,
        pp: ppMrr,
        total: gcArr + ppMrr,
        actif: isActive ? 1 : 0,
        gcPrev,
        ppPrev,
      };
    });
  }, [trendCurrent, trendCompare, filters.period, trendFilters, isComparing]);

  const inactiveRanges = useMemo(() => {
    if (!evolutionChartData.length) return [];
    const ranges: { start: string; end: string }[] = [];
    let currentStart: string | null = null;
    evolutionChartData.forEach((point, index) => {
      if (point.actif === 0) {
        if (!currentStart) currentStart = point.mois;
        if (index === evolutionChartData.length - 1 && currentStart) {
          ranges.push({ start: currentStart, end: point.mois });
        }
      } else {
        if (currentStart) {
          const prevPoint = evolutionChartData[index - 1];
          ranges.push({
            start: currentStart,
            end: prevPoint.mois || point.mois,
          });
          currentStart = null;
        }
      }
    });
    return ranges;
  }, [evolutionChartData]);

  // Original evolutionData fallback for tableData bindings
  const evolutionData = useMemo(() => {
    if (!current) return [];
    return buildEvolutionChart(current);
  }, [current]);

  const [visibleSeries, setVisibleSeries] = useState({
    gc: true,
    pp: true,
  });

  const handleLegendClick = (data: unknown) => {
    const legendData = data as { dataKey?: string };
    const { dataKey } = legendData;
    if (dataKey && dataKey in visibleSeries) {
      setVisibleSeries((prev) => ({
        ...prev,
        [dataKey]: !prev[dataKey as keyof typeof visibleSeries],
      }));
    }
  };

  // Modal data - GC segment (Marge Client)
  const gcSegmentColumns: TableColumn[] = [
    { key: "client", label: "Client" },
    { key: "ca", label: "CA HT", format: (v) => formatEur(Number(v) || 0) },
    { key: "marge", label: "Marge", format: (v) => formatEur(Number(v) || 0) },
    { key: "tauxMarge", label: "Taux de marge" },
  ];

  // Modal data - PP segment (MRR evolution without empty details)
  const ppSegmentColumns: TableColumn[] = [
    { key: "mois", label: "Mois" },
    { key: "mrr", label: "MRR", format: (v) => formatEur(Number(v) || 0) },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  if (
    isLoading ||
    isLoadingTrend ||
    isFetching ||
    isFetchingTrend ||
    !current ||
    !trendCurrent
  )
    return <RecapKpiSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="section-title">Récapitulatif KPI Stratégique</h2>
        <p className="text-muted-foreground text-sm">
          Vue consolidée des segments Grands Comptes, Plug &amp; Play et B2C
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BaseKpiCard
          label="MRR Total Récurrent"
          value={formatEur(mrrTotal)}
          previousValue={getPreviousCurrencyValue(mrrTotalPrev)}
          trend={getTrend(mrrTotal, mrrTotalPrev)}
          icon={<Euro className="h-5 w-5 text-primary" />}
          showComparison={isComparing}
          tableTitle="Évolution MRR total"
          tableColumns={[
            { key: "mois", label: "Mois" },
            {
              key: "pp",
              label: "P&P MRR",
              format: (v) => formatEur(Number(v) || 0),
            },
            {
              key: "total",
              label: "Total",
              format: (v) => formatEur(Number(v) || 0),
            },
          ]}
          tableData={evolutionData}
        />
        <BaseKpiCard
          label="ARR Total Récurrent"
          value={formatEur(arrTotal)}
          previousValue={getPreviousCurrencyValue(arrTotalPrev)}
          trend={getTrend(arrTotal, arrTotalPrev)}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          showComparison={isComparing}
          tableTitle="Évolution ARR total"
          tableColumns={[
            { key: "mois", label: "Mois" },
            {
              key: "gc",
              label: "GC ARR",
              format: (v) => formatEur(Number(v) || 0),
            },
            {
              key: "total",
              label: "Total",
              format: (v) => formatEur(Number(v) || 0),
            },
          ]}
          tableData={evolutionData}
        />
        <BaseKpiCard
          label="Clients Grands Comptes"
          value={`${gcClients}`}
          previousValue={getPreviousValue(gcClientsPrev)}
          trend={getTrend(gcClients, gcClientsPrev)}
          icon={<Building2 className="h-5 w-5 text-segment-gc" />}
          showComparison={isComparing}
          tableTitle="Marge par client"
          tableColumns={gcSegmentColumns}
          tableData={gcMarge as unknown as Record<string, string | number>[]}
        />
        <BaseKpiCard
          label="Clients Plug &amp; Play"
          value={`${ppClients}`}
          previousValue={getPreviousValue(ppClientsPrev)}
          trend={getTrend(ppClients, ppClientsPrev)}
          icon={<Zap className="h-5 w-5 text-segment-pp" />}
          showComparison={isComparing}
          tableTitle="Évolution MRR P&P"
          tableColumns={ppSegmentColumns}
          tableData={
            (pp?.mrr.evolution ?? []) as unknown as Record<
              string,
              string | number
            >[]
          }
        />
      </div>

      {/* Segment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grands Comptes */}
        <div
          className="kpi-card border-l-4 border-l-segment-gc cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
          onClick={() => setSegmentModal("gc")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-segment-gc" />
              <h3 className="font-semibold">Grands Comptes</h3>
            </div>
            <span className="text-xs text-muted-foreground underline">
              Détails
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ARR</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatEur(gcArr)}</span>
                {isComparing && gcArrPrev !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    vs {formatEur(gcArrPrev)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Abonnements en cours
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {gc?.contrats?.nombre_abonnements_cours ?? "—"}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Marge (All Clients)
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {gc?.marge_client?.details[0]?.tauxMarge ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plug & Play */}
        <div
          className="kpi-card border-l-4 border-l-segment-pp cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
          onClick={() => setSegmentModal("pp")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-segment-pp" />
              <h3 className="font-semibold">Plug &amp; Play</h3>
            </div>
            <span className="text-xs text-muted-foreground underline">
              Détails
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">MRR</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatEur(ppMrr)}</span>
                {isComparing && ppMrrPrev !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    vs {formatEur(ppMrrPrev)}
                  </span>
                )}
              </div>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Churn 90j</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{ppChurn}%</span>
                {isComparing && ppChurnPrev !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    vs {ppChurnPrev}%
                  </span>
                )}
              </div>
            </div> */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ARPA</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {ppArpa > 0 ? formatEur(ppArpa) : "—"}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Abonnements actifs
              </span>
              <span className="font-semibold">
                {ppAbonnements > 0 ? ppAbonnements : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart — Évolution consolidée */}
      <div className="chart-container transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Évolution du CA récurrent consolidé
          </h3>
          {trendCurrent && (
            <span className="text-xs text-muted-foreground">
              Période : {format(trendFilters.period.start, "MMM yyyy")} →{" "}
              {format(trendFilters.period.end, "MMM yyyy")}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={evolutionChartData}>
            <defs>
              <linearGradient id="colorGC" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(220, 55%, 35%)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(220, 55%, 35%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorPP" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(35, 80%, 55%)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(35, 80%, 55%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
            <XAxis dataKey="mois" stroke="hsl(25, 15%, 45%)" fontSize={12} />
            <YAxis
              stroke="hsl(25, 15%, 45%)"
              fontSize={12}
              tickFormatter={(v) => `${((v || 0) / 1000).toFixed(0)}k€`}
              tickCount={8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(40, 25%, 99%)",
                border: "1px solid hsl(35, 20%, 88%)",
                borderRadius: "0.75rem",
              }}
              formatter={(value: number, name: string) => [
                formatEur(value || 0),
                name === "gc" ||
                name === "Grands Comptes ARR (Prev)" ||
                name === "Grands Comptes ARR"
                  ? "Grands Comptes ARR"
                  : name === "pp" ||
                      name === "Plug & Play MRR (Prev)" ||
                      name === "Plug & Play MRR"
                    ? "Plug & Play MRR"
                    : "Total",
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              onClick={handleLegendClick}
              cursor="pointer"
              formatter={(value, entry: any) => {
                const { dataKey } = entry;
                const normalizedKey = dataKey?.replace(
                  "Prev",
                  "",
                ) as keyof typeof visibleSeries;
                const isHidden = dataKey && !visibleSeries[normalizedKey];
                return (
                  <span style={{ opacity: isHidden ? 0.5 : 1 }}>{value}</span>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="gc"
              name="Grands Comptes ARR"
              stroke="hsl(220, 55%, 35%)"
              fill="url(#colorGC)"
              strokeWidth={2}
              fillOpacity={1}
              activeDot={{ r: 6 }}
              hide={!visibleSeries.gc}
            />
            <Area
              type="monotone"
              dataKey="pp"
              name="Plug & Play MRR"
              stroke="hsl(35, 80%, 55%)"
              fill="url(#colorPP)"
              strokeWidth={2}
              fillOpacity={1}
              activeDot={{ r: 6 }}
              hide={!visibleSeries.pp}
            />

            {isComparing && (
              <>
                <Area
                  type="monotone"
                  dataKey="gcPrev"
                  name="Grands Comptes ARR (Prev)"
                  stroke="hsl(220, 55%, 35%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={{
                    fill: "hsl(220, 55%, 35%)",
                    r: 3,
                    strokeDasharray: "none",
                  }}
                  activeDot={{ r: 5 }}
                  hide={!visibleSeries.gc}
                />
                <Area
                  type="monotone"
                  dataKey="ppPrev"
                  name="Plug & Play MRR (Prev)"
                  stroke="hsl(35, 80%, 55%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={{
                    fill: "hsl(35, 80%, 55%)",
                    r: 3,
                    strokeDasharray: "none",
                  }}
                  activeDot={{ r: 5 }}
                  hide={!visibleSeries.pp}
                />
              </>
            )}

            {inactiveRanges.map((range, index) => (
              <ReferenceArea
                key={`inactive-${index}`}
                x1={range.start}
                x2={range.end}
                fill="rgba(149, 137, 137, 0.7)"
                strokeOpacity={0}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Modals */}
      <DataTableModal
        open={segmentModal === "gc"}
        onOpenChange={() => setSegmentModal(null)}
        title="Grands Comptes — Marge par client"
        columns={gcSegmentColumns}
        data={gcMarge as unknown as Record<string, string | number>[]}
        variant="gc"
      />
      <DataTableModal
        open={segmentModal === "pp"}
        onOpenChange={() => setSegmentModal(null)}
        title="Plug & Play — Évolution MRR"
        columns={ppSegmentColumns}
        data={
          (pp ? ppMrrEvolution(pp) : []) as unknown as Record<
            string,
            string | number
          >[]
        }
        variant="pp"
      />
    </div>
  );
}
