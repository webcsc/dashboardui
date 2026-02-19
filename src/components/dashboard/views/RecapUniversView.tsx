import { BaseKpiCard } from "../cards/BaseKpiCard";
import { UniverseCard } from "../cards/UniverseCard";
import { Coffee, Settings, Wrench, Euro, Droplets } from "lucide-react";
import type { FilterState } from "@/types";
import { useMemo } from "react";
import { useSummary } from "@/hooks/useDashboardData";
import { useViewFilters, useComparisonHelpers } from "@/hooks";
import { subMonths } from "date-fns";
import { MONTH_ORDER, FRENCH_MONTHS } from "@/lib/dashboard-constants";
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
import { useModalState } from "@/hooks/useModalState";
import { DataTableModal } from "../modals/DataTableModal";
import { useState, useEffect } from "react";
import { formatPrice, formatWeight, getMonthDuration } from "@/lib";
import { RecapUniversSkeleton } from "../skeletons";

interface RecapUniversViewProps {
  filters: FilterState;
  isComparing: boolean;
}

interface EvolutionDataItem {
  ca_total_ht?: number;
}

type MonthData = Record<
  string,
  EvolutionDataItem | { [key: string]: EvolutionDataItem }
>;

export function RecapUniversView({
  filters,
  isComparing,
}: RecapUniversViewProps) {
  // Modal state
  const { openModals, openModal, closeModal } = useModalState(["evolution"]);

  // Fetch summary data for current period
  const { data: summaryResponse } = useSummary(filters);

  const [modalClientId, setModalClientId] = useState<string | undefined>();
  // Sync modal filter
  useEffect(() => {
    if (openModals.evolution) {
      setModalClientId(filters.clientId);
    }
  }, [openModals.evolution, filters.clientId]);

  // Use custom hooks for filters and comparison helpers
  const { modalFilters: baseModalFilters, comparisonFilters } = useViewFilters(
    filters,
    modalClientId,
  );
  const { getTrend, getPreviousCurrencyValue } =
    useComparisonHelpers(isComparing);

  // RecapUniversView uses specific modal logic (only 'evolution' modal uses client filter)
  // so we adapt the hook output
  const modalFilters = baseModalFilters;

  // Fetch summary data for modal (specific client filter)
  const { data: modalSummaryResponse } = useSummary(modalFilters, {
    enabled: !!openModals.evolution,
  });

  const modalSummary = modalSummaryResponse;

  const { data: compareSummaryResponse } = useSummary(comparisonFilters, {
    enabled: isComparing && !!filters.comparePeriod,
  });

  // Fetch 12-month rolling window data OR full period if > 12 months for the chart
  const trendFilters = useMemo(() => {
    if (!filters.period.start || !filters.period.end) return filters;

    const duration = getMonthDuration(filters.period.start, filters.period.end);

    // If duration > 12 months, use the full selected period
    if (duration > 12) {
      return filters;
    }

    // Otherwise, force 12 months rolling window
    const end = filters.period.end;
    const start = subMonths(end, 11);
    // Align start to beginning of month to be safe
    start.setDate(1);

    return {
      ...filters,
      period: { start, end },
    };
  }, [filters]);

  const trendComparisonFilters = useMemo(() => {
    if (!comparisonFilters?.period?.start || !comparisonFilters?.period?.end)
      return null;

    const duration = getMonthDuration(
      comparisonFilters.period.start,
      comparisonFilters.period.end,
    );

    if (duration > 12) {
      return comparisonFilters;
    }

    const end = comparisonFilters.period.end;
    const start = subMonths(end, 11);
    start.setDate(1);

    return {
      ...comparisonFilters,
      period: { start, end },
    };
  }, [comparisonFilters]);

  const { data: trendSummaryResponse, isLoading: isLoadingTrend } =
    useSummary(trendFilters);
  const { data: trendCompareSummaryResponse } = useSummary(
    trendComparisonFilters,
    {
      enabled: isComparing && !!trendComparisonFilters,
    },
  );

  const summary = summaryResponse;
  const trendSummary = trendSummaryResponse;
  const compareSummary = compareSummaryResponse;
  const trendCompareSummary = trendCompareSummaryResponse;

  // Calculate totals and trends
  const caTotal =
    (summary?.overview?.cafe?.ca_total_ht_global || 0) +
    (summary?.overview?.equipement?.ca_total_ht_global || 0) +
    (summary?.overview?.service?.ca_total_ht_global || 0) +
    (summary?.overview?.consommable?.ca_total_ht_global || 0);

  const compareCaTotal = compareSummary
    ? (compareSummary.overview?.cafe?.ca_total_ht_global || 0) +
      (compareSummary.overview?.equipement?.ca_total_ht_global || 0) +
      (compareSummary.overview?.service?.ca_total_ht_global || 0) +
      (compareSummary.overview?.consommable?.ca_total_ht_global || 0)
    : 0;

  // Calculate market share
  const getMarketShare = (universeCA: number) => {
    if (!caTotal || caTotal === 0) return 0;
    return Math.round((universeCA / caTotal) * 100);
  };

  // Transform evolution data for chart

  const currentYear = filters.period.start.getFullYear().toString();

  const evolutionChartData = useMemo(() => {
    if (!trendSummary?.evolution) return [];

    const start = trendFilters.period.start;
    const end = trendFilters.period.end;
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    // Generate month/year keys for the selected period
    const periodKeys: {
      year: string;
      month: string;
      label: string;
      date: Date;
    }[] = [];
    const current = new Date(start);
    // Align to start of month
    current.setDate(1);

    // Check if period spans multiple years
    const isMultiYear = startYear !== endYear;

    while (current <= end) {
      const year = current.getFullYear().toString();
      const month = MONTH_ORDER[current.getMonth()];
      // If multi-year, always include year to avoid confusion (e.g. Jan 2023 vs Jan 2024)
      const label = isMultiYear
        ? `${FRENCH_MONTHS[month]} ${year}`
        : FRENCH_MONTHS[month] || month.substring(0, 3);

      periodKeys.push({
        year,
        month,
        label,
        date: new Date(current),
      });
      // Next month
      current.setMonth(current.getMonth() + 1);
    }

    // Generate keys for the comparison period (if applicable)
    // We want to map index i of periodKeys to index i of the comparison period
    const compareKeys: { year: string; month: string }[] = [];
    if (isComparing && trendComparisonFilters?.period) {
      const compareCurrent = new Date(trendComparisonFilters.period.start);
      compareCurrent.setDate(1);

      // We generate exactly as many keys as the main period
      for (let i = 0; i < periodKeys.length; i++) {
        compareKeys.push({
          year: compareCurrent.getFullYear().toString(),
          month: MONTH_ORDER[compareCurrent.getMonth()],
        });
        compareCurrent.setMonth(compareCurrent.getMonth() + 1);
      }
    }

    const cafeData = trendSummary.evolution.cafe;
    const equipementData = trendSummary.evolution.equipement;
    const serviceData = trendSummary.evolution.service;
    const consommableData = trendSummary.evolution.consommable;

    // Previous year data for comparison (if enabled)
    const cafePrevData = compareSummary?.evolution?.cafe;
    const equipementPrevData = compareSummary?.evolution?.equipement;
    const servicePrevData = compareSummary?.evolution?.service;
    const consommablePrevData = compareSummary?.evolution?.consommable;

    return periodKeys.map(({ year, month, label, date }, index) => {
      let cafe = 0;
      let equipement = 0;
      let service = 0;
      let consommable = 0;
      let cafePrev = 0;
      let equipementPrev = 0;
      let servicePrev = 0;
      let consommablePrev = 0;

      // Cafe
      const cafeYearData = cafeData?.[year];
      if (cafeYearData?.[month]) {
        // Match new structure { cafe: { ca_total_ht: ... } }
        const mData = cafeYearData[month] as any;
        cafe = mData?.cafe?.ca_total_ht || mData?.ca_total_ht || 0;
      }

      // Equipement
      const equipYearData = equipementData?.[year];
      if (equipYearData?.[month]) {
        const mData = equipYearData[month] as MonthData;
        if (mData && typeof mData === "object") {
          equipement = Number(
            Object.values(mData).reduce(
              (acc: number, item: EvolutionDataItem) =>
                acc + Number(item?.ca_total_ht) || 0,
              0,
            ),
          );
        }
      }

      // Service
      const serviceYearData = serviceData?.[year];
      if (serviceYearData?.[month]) {
        const mData = serviceYearData[month] as MonthData;
        if (mData && typeof mData === "object") {
          service = Number(
            Object.values(mData).reduce(
              (acc: number, item: EvolutionDataItem) =>
                acc + (Number(item?.ca_total_ht) || 0),
              0,
            ),
          );
        }
      }

      // Consommable
      const consommableYearData = consommableData?.[year];
      if (consommableYearData?.[month]) {
        const mData = consommableYearData[month] as Record<string, any>;
        if (
          typeof mData === "object" &&
          !mData.ca_total_ht &&
          !mData.consommable
        ) {
          // New multi-category structure (e.g., { "Thé": {...}, "Divers": {...} })
          consommable = Object.values(mData).reduce(
            (acc, item) => acc + (Number(item?.ca_total_ht) || 0),
            0,
          );
        } else {
          // Old structure or direct "consommable" key
          consommable =
            mData?.consommable?.ca_total_ht || mData?.ca_total_ht || 0;
        }
      }

      // Comparison Data
      if (isComparing && compareKeys[index]) {
        const { year: prevYear, month: prevMonth } = compareKeys[index];

        if (cafePrevData?.[prevYear]?.[prevMonth]) {
          const mData = cafePrevData[prevYear][prevMonth] as any;
          cafePrev = mData?.cafe?.ca_total_ht || mData?.ca_total_ht || 0;
        }

        if (equipementPrevData?.[prevYear]?.[prevMonth]) {
          const mData = equipementPrevData[prevYear][prevMonth] as MonthData;
          equipementPrev = Number(
            Object.values(mData).reduce<number>(
              (acc, item: EvolutionDataItem) =>
                acc + (Number(item?.ca_total_ht) || 0),
              0,
            ),
          );
        }

        if (servicePrevData?.[prevYear]?.[prevMonth]) {
          const mData = servicePrevData[prevYear][prevMonth] as MonthData;
          servicePrev = Number(
            Object.values(mData).reduce<number>(
              (acc, item: EvolutionDataItem) =>
                acc + (Number(item?.ca_total_ht) || 0),
              0,
            ),
          );
        }

        if (consommablePrevData?.[prevYear]?.[prevMonth]) {
          const mData = consommablePrevData[prevYear][prevMonth] as Record<
            string,
            any
          >;
          if (
            typeof mData === "object" &&
            !mData.ca_total_ht &&
            !mData.consommable
          ) {
            consommablePrev = Object.values(mData).reduce(
              (acc, item) => acc + (Number(item?.ca_total_ht) || 0),
              0,
            );
          } else {
            consommablePrev =
              mData?.consommable?.ca_total_ht || mData?.ca_total_ht || 0;
          }
        }
      }

      // Determine 'actif' state
      const checkDate = new Date(date);
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
        mois: label,
        originalMonth: month,
        year,
        cafe,
        equipement,
        service,
        consommable,
        actif: isActive ? 1 : 0,
        ...(isComparing && {
          cafePrev,
          equipementPrev,
          servicePrev,
          consommablePrev,
        }),
      };
    });
  }, [
    trendSummary,
    trendCompareSummary,
    filters.period,
    trendFilters,
    trendComparisonFilters,
    isComparing,
  ]);

  // Calculate inactive ranges for ReferenceArea
  const inactiveRanges = useMemo(() => {
    if (!evolutionChartData.length) return [];

    const ranges: { start: string; end: string }[] = [];
    let currentStart: string | null = null;

    evolutionChartData.forEach((point, index) => {
      if (point.actif === 0) {
        if (!currentStart) {
          currentStart = point.mois;
        }
        // If it's the last point, close the range
        if (index === evolutionChartData.length - 1 && currentStart) {
          ranges.push({ start: currentStart, end: point.mois });
        }
      } else {
        if (currentStart) {
          // Close the previous range.
          // We need the *previous* point as end, but since we are at an active point,
          // the inactive range ended at index-1.
          const prevPoint = evolutionChartData[index - 1];
          ranges.push({ start: currentStart, end: prevPoint.mois });
          currentStart = null;
        }
      }
    });

    return ranges;
  }, [evolutionChartData]);

  // Modal Evolution Data transformation (uses modalSummary)
  const modalEvolutionChartData = useMemo(() => {
    if (!modalSummary?.evolution) return [];

    const monthlyData: Record<
      string,
      { cafe: number; equipement: number; service: number; consommable: number }
    > = {};
    MONTH_ORDER.forEach((month) => {
      monthlyData[month] = {
        cafe: 0,
        equipement: 0,
        service: 0,
        consommable: 0,
      };
    });

    // Process current period cafe evolution (object structure)
    const cafeEvolution = modalSummary.evolution.cafe?.[currentYear];
    if (cafeEvolution) {
      Object.entries(cafeEvolution).forEach(([month, data]) => {
        if (
          month !== "total" &&
          typeof data === "object" &&
          data !== null &&
          "cafe" in data &&
          typeof data.cafe === "object" &&
          data.cafe !== null &&
          "ca_total_ht" in data.cafe
        ) {
          const monthIndex = MONTH_ORDER.indexOf(month);
          if (monthIndex > -1) {
            monthlyData[month].cafe = data.cafe.ca_total_ht as number;
          }
        }
      });
    }

    // Process current period equipement evolution (object structure)
    const equipementEvolution =
      modalSummary.evolution.equipement?.[currentYear];
    if (equipementEvolution) {
      Object.entries(equipementEvolution).forEach(([month, dataObject]) => {
        if (month !== "total" && dataObject && typeof dataObject === "object") {
          const monthTotal = Object.values(dataObject as MonthData).reduce(
            (acc: number, item: EvolutionDataItem) =>
              acc + (Number(item?.ca_total_ht) || 0),
            0,
          );
          const monthIndex = MONTH_ORDER.indexOf(month);
          if (monthIndex > -1) {
            monthlyData[month].equipement = Number(monthTotal);
          }
        }
      });
    }

    // Process current period service evolution (object structure)
    const serviceEvolution = modalSummary.evolution.service?.[currentYear];
    if (serviceEvolution) {
      Object.entries(serviceEvolution).forEach(([month, dataObject]) => {
        if (month !== "total" && dataObject && typeof dataObject === "object") {
          const monthTotal = Object.values(dataObject as MonthData).reduce(
            (acc: number, item: EvolutionDataItem) =>
              acc + (Number(item?.ca_total_ht) || 0),
            0,
          );
          const monthIndex = MONTH_ORDER.indexOf(month);
          if (monthIndex > -1) {
            monthlyData[month].service = Number(monthTotal);
          }
        }
      });
    }

    // Process current period consommable evolution
    const consommableEvolution =
      modalSummary.evolution.consommable?.[currentYear];
    if (consommableEvolution) {
      Object.entries(consommableEvolution).forEach(([month, data]) => {
        if (
          month !== "total" &&
          typeof data === "object" &&
          data !== null &&
          "consommable" in data &&
          typeof data.consommable === "object" &&
          data.consommable !== null &&
          "ca_total_ht" in data.consommable
        ) {
          const monthIndex = MONTH_ORDER.indexOf(month);
          if (monthIndex > -1) {
            monthlyData[month].consommable = data.consommable
              .ca_total_ht as number;
          }
        }
      });
    }

    return Object.entries(monthlyData)
      .sort(
        ([monthA], [monthB]) =>
          MONTH_ORDER.indexOf(monthA) - MONTH_ORDER.indexOf(monthB),
      )
      .map(([month, data]) => ({
        mois: FRENCH_MONTHS[month] || month.substring(0, 3),
        cafe: data.cafe,
        equipement: data.equipement,
        service: data.service,
        consommable: data.consommable,
      }));
  }, [modalSummary, currentYear]);

  // State for chart series visibility
  const [visibleSeries, setVisibleSeries] = useState({
    cafe: true,
    equipement: true,
    service: true,
    consommable: true,
  });

  const handleLegendClick = (data: unknown) => {
    // The data parameter contains the clicked legend item
    const legendData = data as { dataKey?: string };
    const { dataKey } = legendData;
    if (dataKey && dataKey in visibleSeries) {
      setVisibleSeries((prev) => ({
        ...prev,
        [dataKey]: !prev[dataKey as keyof typeof visibleSeries],
      }));
    }
  };

  // Show skeleton while loading (after all hooks have been called)
  if (isLoadingTrend || !summary) {
    return <RecapUniversSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="section-title">Récapitulatif par Univers</h2>
        <p className="text-muted-foreground text-sm">
          Vue consolidée des univers Café, Équipement et Service
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <BaseKpiCard
          label="CA Total Univers"
          value={formatPrice(caTotal)}
          previousValue={getPreviousCurrencyValue(compareCaTotal)}
          trend={getTrend(caTotal, compareCaTotal)}
          icon={<Euro className="h-5 w-5 text-primary" />}
          showComparison={isComparing}
        />
        <BaseKpiCard
          label="CA Univers Café "
          value={formatPrice(summary?.overview?.cafe?.ca_total_ht_global || 0)}
          previousValue={getPreviousCurrencyValue(
            compareSummary?.overview?.cafe?.ca_total_ht_global,
          )}
          trend={getTrend(
            summary?.overview?.cafe?.ca_total_ht_global,
            compareSummary?.overview?.cafe?.ca_total_ht_global,
          )}
          icon={<Coffee className="h-5 w-5 text-universe-cafe" />}
          showComparison={isComparing}
        />
        <BaseKpiCard
          label="CA Thé & Divers "
          value={formatPrice(
            summary?.overview?.consommable?.ca_total_ht_global || 0,
          )}
          previousValue={getPreviousCurrencyValue(
            compareSummary?.overview?.consommable?.ca_total_ht_global,
          )}
          trend={getTrend(
            summary?.overview?.consommable?.ca_total_ht_global,
            compareSummary?.overview?.consommable?.ca_total_ht_global,
          )}
          icon={<Droplets className="h-5 w-5 text-universe-thedivers" />}
          showComparison={isComparing}
        />
        <BaseKpiCard
          label="CA Équipement"
          value={formatPrice(
            summary?.overview?.equipement?.ca_total_ht_global || 0,
          )}
          previousValue={getPreviousCurrencyValue(
            compareSummary?.overview?.equipement?.ca_total_ht_global,
          )}
          trend={getTrend(
            summary?.overview?.equipement?.ca_total_ht_global,
            compareSummary?.overview?.equipement?.ca_total_ht_global,
          )}
          icon={<Settings className="h-5 w-5 text-universe-equipement" />}
          showComparison={isComparing}
        />
        <BaseKpiCard
          label="CA Service"
          value={formatPrice(
            summary?.overview?.service?.ca_total_ht_global || 0,
          )}
          previousValue={getPreviousCurrencyValue(
            compareSummary?.overview?.service?.ca_total_ht_global,
          )}
          trend={getTrend(
            summary?.overview?.service?.ca_total_ht_global,
            compareSummary?.overview?.service?.ca_total_ht_global,
          )}
          icon={<Wrench className="h-5 w-5 text-universe-service" />}
          showComparison={isComparing}
        />
      </div>

      {/* Univers cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UniverseCard
          title="Café"
          icon={<Coffee className="h-5 w-5" />}
          borderColorClass="border-l-universe-cafe"
          iconColorClass="text-universe-cafe"
          rows={[
            {
              label: "CA Mensuel",
              value: formatPrice(
                summary?.overview?.cafe?.ca_total_ht_cafe || 0,
              ),
              compareValue: `vs ${getPreviousCurrencyValue(
                compareSummary?.overview?.cafe?.ca_total_ht_cafe,
              )}`,
              showComparison: isComparing,
            },
            {
              label: "Volume",
              value: formatWeight(
                summary?.overview?.cafe?.volume_total_global || 0,
              ),
              compareValue: formatWeight(
                compareSummary?.overview?.cafe?.volume_total_global || 0,
              ),
              showComparison: isComparing,
            },
            {
              label: "Part de marché",
              value: `${getMarketShare(summary?.overview?.cafe?.ca_total_ht_global || 0)}%`,
            },
          ]}
        />

        <UniverseCard
          title="Thé & Divers"
          icon={<Droplets className="h-5 w-5" />}
          borderColorClass="border-l-universe-thedivers"
          iconColorClass="text-universe-thedivers"
          rows={[
            {
              label: "CA Mensuel",
              value: formatPrice(
                summary?.overview?.consommable?.ca_total_ht_global || 0,
              ),
              compareValue: `vs ${getPreviousCurrencyValue(
                compareSummary?.overview?.consommable?.ca_total_ht_global,
              )}`,
              showComparison: isComparing,
            },
            // {
            //   label: "Thés",
            //   value: formatPrice(
            //     summary?.overview?.consommable?.ca_location_total_ht || 0,
            //   ),
            // },
            {
              label: "Part de marché",
              value: `${getMarketShare(summary?.overview?.consommable?.ca_total_ht_global || 0)}%`,
            },
          ]}
        />

        <UniverseCard
          title="Équipement"
          icon={<Settings className="h-5 w-5" />}
          borderColorClass="border-l-universe-equipement"
          iconColorClass="text-universe-equipement"
          rows={[
            {
              label: "CA Mensuel",
              value: formatPrice(
                summary?.overview?.equipement?.ca_total_ht_global || 0,
              ),
              compareValue: `vs ${getPreviousCurrencyValue(
                compareSummary?.overview?.equipement?.ca_total_ht_global,
              )}`,
              showComparison: isComparing,
            },
            {
              label: "Location",
              value: formatPrice(
                summary?.overview?.equipement?.ca_location_total_ht || 0,
              ),
            },
            {
              label: "Part de marché",
              value: `${getMarketShare(summary?.overview?.equipement?.ca_total_ht_global || 0)}%`,
            },
          ]}
        />

        <UniverseCard
          title="Service"
          icon={<Wrench className="h-5 w-5" />}
          borderColorClass="border-l-universe-service"
          iconColorClass="text-universe-service"
          rows={[
            {
              label: "CA Mensuel",
              value: formatPrice(
                summary?.overview?.service?.ca_total_ht_global || 0,
              ),
              compareValue: `vs ${getPreviousCurrencyValue(
                compareSummary?.overview?.service?.ca_total_ht_global,
              )}`,
              showComparison: isComparing,
            },
            {
              label: "Cartouches",
              value: formatPrice(
                summary?.overview?.service?.ca_cartouche_total_ht || 0,
              ),
            },
            {
              label: "Part de marché",
              value: `${getMarketShare(summary?.overview?.service?.ca_total_ht_global || 0)}%`,
            },
          ]}
        />
      </div>

      {/* Chart - Evolution with 3 universes */}
      <div
        className="chart-container cursor-pointer hover:shadow-lg transition-all"
        onClick={(e) => {
          // Prevent modal opening when clicking legend
          if ((e.target as Element).closest(".recharts-legend-wrapper")) {
            e.stopPropagation();
            return;
          }
          openModal("evolution");
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Évolution du CA par univers</h3>
          <span className="text-xs text-muted-foreground underline">
            Voir tableau
          </span>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={evolutionChartData}>
            <defs>
              <linearGradient id="colorCafe" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(25, 70%, 50%)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(25, 70%, 50%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorEquipement" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(200, 55%, 40%)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(200, 55%, 40%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorConsommable" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(160, 50%, 40%)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(160, 50%, 40%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(280, 45%, 45%)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(280, 45%, 45%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
            <XAxis dataKey="mois" stroke="hsl(25, 15%, 45%)" fontSize={12} />
            <YAxis
              stroke="hsl(25, 15%, 45%)"
              fontSize={12}
              tickFormatter={(value) => `${((value || 0) / 1000).toFixed(0)}k`}
              tickCount={8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(40, 25%, 99%)",
                border: "1px solid hsl(35, 20%, 88%)",
                borderRadius: "0.75rem",
              }}
              formatter={(value: number) => formatPrice(value)}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              onClick={handleLegendClick}
              cursor="pointer"
              formatter={(value, entry: any) => {
                const { dataKey } = entry;
                const isHidden =
                  dataKey &&
                  !visibleSeries[dataKey as keyof typeof visibleSeries];
                return (
                  <span style={{ opacity: isHidden ? 0.5 : 1 }}>{value}</span>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="cafe"
              name="Café"
              stroke="hsl(25, 70%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCafe)"
              activeDot={{ r: 6 }}
              hide={!visibleSeries.cafe}
            />
            <Area
              type="monotone"
              dataKey="consommable"
              name="Thé & Divers"
              stroke="hsl(160, 50%, 40%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorConsommable)"
              activeDot={{ r: 6 }}
              hide={!visibleSeries.consommable}
            />
            <Area
              type="monotone"
              dataKey="equipement"
              name="Équipement"
              stroke="hsl(200, 55%, 40%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEquipement)"
              activeDot={{ r: 6 }}
              hide={!visibleSeries.equipement}
            />
            <Area
              type="monotone"
              dataKey="service"
              name="Service"
              stroke="hsl(280, 45%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorService)"
              activeDot={{ r: 6 }}
              hide={!visibleSeries.service}
            />
            {/* Comparison period lines - represented as unfilled dashed Areas for visual clarity */}
            {isComparing && (
              <>
                <Area
                  type="monotone"
                  dataKey="cafePrev"
                  name="Café (Prev)"
                  stroke="hsl(25, 70%, 50%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={{
                    fill: "hsl(25, 70%, 50%)",
                    r: 3,
                    strokeDasharray: "none",
                  }}
                  activeDot={{ r: 5 }}
                  hide={!visibleSeries.cafe}
                />
                <Area
                  type="monotone"
                  dataKey="equipementPrev"
                  name="Équipement (Prev)"
                  stroke="hsl(200, 55%, 40%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={{
                    fill: "hsl(200, 55%, 40%)",
                    r: 3,
                    strokeDasharray: "none",
                  }}
                  activeDot={{ r: 5 }}
                  hide={!visibleSeries.equipement}
                />
                <Area
                  type="monotone"
                  dataKey="servicePrev"
                  name="Service (Prev)"
                  stroke="hsl(280, 45%, 45%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={{
                    fill: "hsl(280, 45%, 45%)",
                    r: 3,
                    strokeDasharray: "none",
                  }}
                  activeDot={{ r: 5 }}
                  hide={!visibleSeries.service}
                />
                <Area
                  type="monotone"
                  dataKey="consommablePrev"
                  name="Thé & Divers (Prev)"
                  stroke="hsl(160, 50%, 40%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={{
                    fill: "hsl(160, 50%, 40%)",
                    r: 3,
                    strokeDasharray: "none",
                  }}
                  activeDot={{ r: 5 }}
                  hide={!visibleSeries.consommable}
                />
              </>
            )}

            {/* Inactive Month Highlights */}
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

      {/* Evolution Modal */}
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal("evolution")}
        title="Évolution du CA par univers - Détails"
        columns={[
          { key: "mois", label: "Mois" },
          {
            key: "cafe",
            label: "Café",
            format: (v) => formatPrice(v),
          },
          {
            key: "consommable",
            label: "Thé & Divers",
            format: (v) => formatPrice(v),
          },
          {
            key: "equipement",
            label: "Équipement",
            format: (v) => formatPrice(v),
          },
          {
            key: "service",
            label: "Service",
            format: (v) => formatPrice(v),
          },
          {
            key: "total",
            label: "Total",
            format: (v) => formatPrice(v),
          },
        ]}
        clientId={modalClientId}
        onClientChange={setModalClientId}
        data={modalEvolutionChartData.map((item) => ({
          ...item,
          total:
            (item.cafe || 0) +
            (item.consommable || 0) +
            (item.equipement || 0) +
            (item.service || 0),
        }))}
        variant="cafe"
      />
    </div>
  );
}
