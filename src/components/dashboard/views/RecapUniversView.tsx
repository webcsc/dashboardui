import { BaseKpiCard } from "../cards/BaseKpiCard";
import { Coffee, Settings, Wrench, Euro } from "lucide-react";
import type { FilterState } from "@/types";
import { useMemo } from "react";
import { useSummary } from "@/hooks/useDashboardData";
import { calculateTrend } from "@/lib/trend-utils";
// Trigger HMR update
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useModalState } from "@/hooks/useModalState";
import { DataTableModal } from "../modals/DataTableModal";
import { useState, useEffect } from "react";

interface RecapUniversViewProps {
  filters: FilterState;
  isComparing: boolean;
}

export function RecapUniversView({ filters, isComparing }: RecapUniversViewProps) {
  // Modal state
  const { openModals, openModal, closeModal } = useModalState(['evolution']);

  // Fetch summary data for current period
  const { data: summaryResponse } = useSummary(filters);

  const [modalClientId, setModalClientId] = useState<string | undefined>();
  // Sync modal filter
  useEffect(() => {
    if (openModals.evolution) {
      setModalClientId(filters.clientId);
    }
  }, [openModals.evolution, filters.clientId]);

  const modalFilters = useMemo(() => ({
    ...filters,
    clientId: modalClientId
  }), [filters, modalClientId]);

  // Fetch summary data for modal (specific client filter)
  const { data: modalSummaryResponse } = useSummary(modalFilters, {
    enabled: !!openModals.evolution
  });

  const modalSummary = modalSummaryResponse;

  // Comparison data for previous period
  const comparisonFilters = useMemo(() => ({
    ...filters,
    period: filters.comparePeriod || filters.period
  }), [filters]);

  const { data: compareSummaryResponse } = useSummary(comparisonFilters, {
    enabled: isComparing && !!filters.comparePeriod
  });

  const summary = summaryResponse;
  const compareSummary = compareSummaryResponse;

  // Calculate totals and trends
  const caTotal = (summary?.overview?.cafe?.ca_total_ht_global || 0) +
    (summary?.overview?.equipement?.ca_total_ht_global || 0) +
    (summary?.overview?.service?.ca_total_ht_global || 0);

  const compareCaTotal = compareSummary ?
    (compareSummary.overview?.cafe?.ca_total_ht_global || 0) +
    (compareSummary.overview?.equipement?.ca_total_ht_global || 0) +
    (compareSummary.overview?.service?.ca_total_ht_global || 0) : 0;

  // Helper functions
  const getTrend = (current?: number, previous?: number) => {
    if (!isComparing || previous === undefined || previous === 0) return undefined;
    return calculateTrend(current || 0, previous || 0).value;
  };

  const getPreviousValue = (previous?: number) => {
    if (!isComparing || previous === undefined) return "-";
    return `${((previous || 0) / 1000).toFixed(1)}k€`;
  };

  // Calculate market share
  const getMarketShare = (universeCA: number) => {
    if (!caTotal || caTotal === 0) return 0;
    return Math.round((universeCA / caTotal) * 100);
  };

  // Transform evolution data for chart
  const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const frenchMonths: Record<string, string> = {
    "January": "Jan", "February": "Fév", "March": "Mar", "April": "Avr",
    "May": "Mai", "June": "Juin", "July": "Juil", "August": "Août",
    "September": "Sep", "October": "Oct", "November": "Nov", "December": "Déc"
  };

  const currentYear = filters.period.start.getFullYear().toString();


  const evolutionChartData = useMemo(() => {
    if (!summary?.evolution) return [];

    const monthlyData: Record<string, { cafe: number; equipement: number; service: number; cafePrev?: number; equipementPrev?: number; servicePrev?: number; }> = {};

    // Process current period cafe evolution (object structure)
    const cafeEvolution = summary.evolution.cafe?.[currentYear];
    if (cafeEvolution) {
      Object.entries(cafeEvolution).forEach(([month, data]: [string, any]) => {
        if (month !== 'total' && data?.ca_total_ht) {
          if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
          monthlyData[month].cafe = data.ca_total_ht;
        }
      });
    }

    // Process current period equipement evolution (array structure)
    const equipementEvolution = summary.evolution.equipement?.[currentYear];
    if (equipementEvolution) {
      Object.entries(equipementEvolution).forEach(([month, dataArray]: [string, any]) => {
        if (month !== 'total' && Array.isArray(dataArray)) {
          if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
          monthlyData[month].equipement = dataArray.reduce((sum: number, item: any) => sum + (item.ca_total_ht || 0), 0);
        }
      });
    }

    // Process current period service evolution (array structure)
    const serviceEvolution = summary.evolution.service?.[currentYear];
    if (serviceEvolution) {
      Object.entries(serviceEvolution).forEach(([month, dataArray]: [string, any]) => {
        if (month !== 'total' && Array.isArray(dataArray)) {
          if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
          monthlyData[month].service = dataArray.reduce((sum: number, item: any) => sum + (item.ca_total_ht || 0), 0);
        }
      });
    }

    // Process comparison period data if available
    if (isComparing && compareSummary?.evolution) {
      const compareYear = comparisonFilters.period?.start?.getFullYear()?.toString() || currentYear;

      // Comparison cafe evolution
      const compareCafeEvolution = compareSummary.evolution.cafe?.[compareYear];
      if (compareCafeEvolution) {
        Object.entries(compareCafeEvolution).forEach(([month, data]: [string, any]) => {
          if (month !== 'total' && data?.ca_total_ht) {
            if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
            monthlyData[month].cafePrev = data.ca_total_ht;
          }
        });
      }

      // Comparison equipement evolution
      const compareEquipementEvolution = compareSummary.evolution.equipement?.[compareYear];
      if (compareEquipementEvolution) {
        Object.entries(compareEquipementEvolution).forEach(([month, dataArray]: [string, any]) => {
          if (month !== 'total' && Array.isArray(dataArray)) {
            if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
            monthlyData[month].equipementPrev = dataArray.reduce((sum: number, item: any) => sum + (item.ca_total_ht || 0), 0);
          }
        });
      }

      // Comparison service evolution
      const compareServiceEvolution = compareSummary.evolution.service?.[compareYear];
      if (compareServiceEvolution) {
        Object.entries(compareServiceEvolution).forEach(([month, dataArray]: [string, any]) => {
          if (month !== 'total' && Array.isArray(dataArray)) {
            if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
            monthlyData[month].servicePrev = dataArray.reduce((sum: number, item: any) => sum + (item.ca_total_ht || 0), 0);
          }
        });
      }
    }

    // Convert to array and sort by month - return separate universe values with comparison
    return Object.entries(monthlyData)
      .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
      .map(([month, data]) => ({
        mois: frenchMonths[month] || month.substring(0, 3),
        cafe: data.cafe,
        equipement: data.equipement,
        service: data.service,
        ...(isComparing && {
          cafePrev: data.cafePrev || 0,
          equipementPrev: data.equipementPrev || 0,
          servicePrev: data.servicePrev || 0
        })
      }));
  }, [summary, compareSummary, currentYear, isComparing, comparisonFilters]);

  // Modal Evolution Data transformation (uses modalSummary)
  const modalEvolutionChartData = useMemo(() => {
    if (!modalSummary?.evolution) return [];

    const monthlyData: Record<string, { cafe: number; equipement: number; service: number; }> = {};

    // Process current period cafe evolution (object structure)
    const cafeEvolution = modalSummary.evolution.cafe?.[currentYear];
    if (cafeEvolution) {
      Object.entries(cafeEvolution).forEach(([month, data]: [string, any]) => {
        if (month !== 'total' && data?.ca_total_ht) {
          if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
          monthlyData[month].cafe = data.ca_total_ht;
        }
      });
    }

    // Process current period equipement evolution (array structure)
    const equipementEvolution = modalSummary.evolution.equipement?.[currentYear];
    if (equipementEvolution) {
      Object.entries(equipementEvolution).forEach(([month, dataArray]: [string, any]) => {
        if (month !== 'total' && Array.isArray(dataArray)) {
          if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
          monthlyData[month].equipement = dataArray.reduce((sum: number, item: any) => sum + (item.ca_total_ht || 0), 0);
        }
      });
    }

    // Process current period service evolution (array structure)
    const serviceEvolution = modalSummary.evolution.service?.[currentYear];
    if (serviceEvolution) {
      Object.entries(serviceEvolution).forEach(([month, dataArray]: [string, any]) => {
        if (month !== 'total' && Array.isArray(dataArray)) {
          if (!monthlyData[month]) monthlyData[month] = { cafe: 0, equipement: 0, service: 0 };
          monthlyData[month].service = dataArray.reduce((sum: number, item: any) => sum + (item.ca_total_ht || 0), 0);
        }
      });
    }

    return Object.entries(monthlyData)
      .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
      .map(([month, data]) => ({
        mois: frenchMonths[month] || month.substring(0, 3),
        cafe: data.cafe,
        equipement: data.equipement,
        service: data.service,
      }));
  }, [modalSummary, currentYear, frenchMonths, monthOrder]);


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="section-title">Récapitulatif par Univers</h2>
        <p className="text-muted-foreground text-sm">Vue consolidée des univers Café, Équipement et Service</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BaseKpiCard
          label="CA Total Univers"
          value={`${((caTotal || 0) / 1000).toFixed(1)}k€`}
          previousValue={getPreviousValue(compareCaTotal)}
          trend={getTrend(caTotal, compareCaTotal)}
          icon={<Euro className="h-5 w-5 text-primary" />}
          showComparison={isComparing}
        />
        <BaseKpiCard
          label="CA Univers Café "
          value={`${((summary?.overview?.cafe?.ca_total_ht_global || 0) / 1000).toFixed(1)}k€`}
          previousValue={getPreviousValue(compareSummary?.overview?.cafe?.ca_total_ht_global)}
          trend={getTrend(summary?.overview?.cafe?.ca_total_ht_global, compareSummary?.overview?.cafe?.ca_total_ht_global)}
          icon={<Coffee className="h-5 w-5 text-universe-cafe" />}
          showComparison={isComparing}
        />
        <BaseKpiCard
          label="CA Équipement"
          value={`${((summary?.overview?.equipement?.ca_total_ht_global || 0) / 1000).toFixed(1)}k€`}
          previousValue={getPreviousValue(compareSummary?.overview?.equipement?.ca_total_ht_global)}
          trend={getTrend(summary?.overview?.equipement?.ca_total_ht_global, compareSummary?.overview?.equipement?.ca_total_ht_global)}
          icon={<Settings className="h-5 w-5 text-universe-equipement" />}
          showComparison={isComparing}
        />
        <BaseKpiCard
          label="CA Service"
          value={`${((summary?.overview?.service?.ca_total_ht_global || 0) / 1000).toFixed(1)}k€`}
          previousValue={getPreviousValue(compareSummary?.overview?.service?.ca_total_ht_global)}
          trend={getTrend(summary?.overview?.service?.ca_total_ht_global, compareSummary?.overview?.service?.ca_total_ht_global)}
          icon={<Wrench className="h-5 w-5 text-universe-service" />}
          showComparison={isComparing}
        />
      </div>

      {/* Univers cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="kpi-card border-l-4 border-l-universe-cafe">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-universe-cafe" />
              <h3 className="font-semibold">Café</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CA Mensuel</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${((summary?.overview?.cafe?.ca_total_ht_global || 0) / 1000).toFixed(1)}k€`}</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs {getPreviousValue(compareSummary?.overview?.cafe?.ca_total_ht_global)}</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Volume</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${Math.round(summary?.overview?.cafe?.volume_total_global || 0)} kg`}</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs {Math.round(compareSummary?.overview?.cafe?.volume_total_global || 0)} kg</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Part de marché</span>
              <span className="font-semibold">{`${getMarketShare(summary?.overview?.cafe?.ca_total_ht_global || 0)}%`}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card border-l-4 border-l-universe-equipement">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-universe-equipement" />
              <h3 className="font-semibold">Équipement</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CA Mensuel</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${((summary?.overview?.equipement?.ca_total_ht_global || 0) / 1000).toFixed(1)}k€`}</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs {getPreviousValue(compareSummary?.overview?.equipement?.ca_total_ht_global)}</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Location</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${((summary?.overview?.equipement?.ca_location_total_ht || 0) / 1000).toFixed(1)}k€`}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Part de marché</span>
              <span className="font-semibold">{`${getMarketShare(summary?.overview?.equipement?.ca_total_ht_global || 0)}%`}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card border-l-4 border-l-universe-service">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-universe-service" />
              <h3 className="font-semibold">Service</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CA Mensuel</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${((summary?.overview?.service?.ca_total_ht_global || 0) / 1000).toFixed(1)}k€`}</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs {getPreviousValue(compareSummary?.overview?.service?.ca_total_ht_global)}</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cartouches</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${((summary?.overview?.service?.ca_cartouche_total_ht || 0) / 1000).toFixed(1)}k€`}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Part de marché</span>
              <span className="font-semibold">{`${getMarketShare(summary?.overview?.service?.ca_total_ht_global || 0)}%`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart - Evolution with 3 universes */}
      <div
        className="chart-container cursor-pointer hover:shadow-lg transition-all"
        onClick={() => openModal('evolution')}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Évolution du CA par univers</h3>
          <span className="text-xs text-muted-foreground underline">
            Voir tableau
          </span>
        </div>
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart data={evolutionChartData}>
            <defs>
              <linearGradient id="colorCafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(25, 70%, 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(25, 70%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEquipement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200, 55%, 40%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(200, 55%, 40%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(140, 50%, 45%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(140, 50%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
            <XAxis dataKey="mois" stroke="hsl(25, 15%, 45%)" fontSize={12} />
            <YAxis
              stroke="hsl(25, 15%, 45%)"
              fontSize={12}
              tickFormatter={(value) => `${((value || 0) / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(40, 25%, 99%)",
                border: "1px solid hsl(35, 20%, 88%)",
                borderRadius: "0.75rem",
              }}
              formatter={(value: number) => `${((value || 0) / 1000).toFixed(0)}k€`}
            />
            <Legend verticalAlign="bottom" height={36} />
            <Area
              type="monotone"
              dataKey="cafe"
              name="Café"
              stroke="hsl(25, 70%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCafe)"
              activeDot={{ r: 6 }}
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
            />
            <Area
              type="monotone"
              dataKey="service"
              name="Service"
              stroke="hsl(140, 50%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorService)"
              activeDot={{ r: 6 }}
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
                  dot={{ fill: "hsl(25, 70%, 50%)", r: 3, strokeDasharray: "none" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="equipementPrev"
                  name="Équipement (Prev)"
                  stroke="hsl(200, 55%, 40%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={{ fill: "hsl(200, 55%, 40%)", r: 3, strokeDasharray: "none" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="servicePrev"
                  name="Service (Prev)"
                  stroke="hsl(140, 50%, 45%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={{ fill: "hsl(140, 50%, 45%)", r: 3, strokeDasharray: "none" }}
                  activeDot={{ r: 5 }}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>


      {/* Evolution Modal */}
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal('evolution')}
        title="Évolution du CA par univers - Détails"
        columns={[
          { key: 'mois', label: 'Mois' },
          {
            key: 'cafe',
            label: 'Café',
            format: (v) => `${((v || 0) / 1000).toFixed(1)}k€`
          },
          {
            key: 'equipement',
            label: 'Équipement',
            format: (v) => `${((v || 0) / 1000).toFixed(1)}k€`
          },
          {
            key: 'service',
            label: 'Service',
            format: (v) => `${((v || 0) / 1000).toFixed(1)}k€`
          },
          {
            key: 'total',
            label: 'Total',
            format: (v) => `${((v || 0) / 1000).toFixed(1)}k€`
          }
        ]}
        clientId={modalClientId}
        onClientChange={setModalClientId}
        data={modalEvolutionChartData.map(item => ({
          ...item,
          total: (item.cafe || 0) + (item.equipement || 0) + (item.service || 0)
        }))}
        variant="cafe"
      />
    </div>
  );
}
