import { useMemo, useState } from "react";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { Zap, TrendingDown, Euro, Target, HeadphonesIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  ReferenceArea,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { FilterState } from "@/types";
import { DataTableModal } from "../modals/DataTableModal";
import {
  useKpiStrategiqueOverviewPlugPlay,
  useKpiStrategiqueEvolutionPlugPlay,
} from "@/hooks/useDashboardData";
import { useViewFilters, useComparisonHelpers } from "@/hooks";
import { UniverseViewSkeleton } from "../skeletons";
import { formatPrice } from "@/lib";

interface PlugPlayViewProps {
  filters: FilterState;
  isComparing: boolean;
}

export function PlugPlayView({ filters, isComparing }: PlugPlayViewProps) {
  const [mrrModalOpen, setMrrModalOpen] = useState(false);
  const [churnModalOpen, setChurnModalOpen] = useState(false);

  // Filters & comparison helpers
  const { comparisonFilters } = useViewFilters(filters);
  const { getTrend, getPreviousValue, getPreviousCurrencyValue } =
    useComparisonHelpers(isComparing);

  // Strip comparePeriod so the main query key stays stable when comparison is toggled
  const mainFilters = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { comparePeriod, ...rest } = filters;
    return rest;
  }, [filters]);

  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    isFetching: isFetchingOverview,
  } = useKpiStrategiqueOverviewPlugPlay(mainFilters);
  const {
    data: evolutionData,
    isLoading: isLoadingEvolution,
    isFetching: isFetchingEvolution,
  } = useKpiStrategiqueEvolutionPlugPlay(mainFilters);

  // Comparison data
  const { data: compareOverviewData } = useKpiStrategiqueOverviewPlugPlay(
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );
  const { data: compareEvolutionData } = useKpiStrategiqueEvolutionPlugPlay(
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );

  const isLoading = isLoadingOverview || isLoadingEvolution;
  const isFetching = isFetchingOverview || isFetchingEvolution;

  const overview = overviewData?.data;
  const compareOverview = compareOverviewData?.data;
  const overviewAny = overview as unknown as
    | Record<string, unknown>
    | undefined;
  const compareOverviewAny = compareOverview as unknown as
    | Record<string, unknown>
    | undefined;
  const evolutionItems = useMemo(
    () => evolutionData?.data ?? [],
    [evolutionData],
  );
  const compareEvolutionItems = useMemo(
    () => compareEvolutionData?.data ?? [],
    [compareEvolutionData],
  );

  const getLastFiniteValue = <T,>(
    items: T[],
    pick: (item: T) => number | undefined,
  ): number | undefined => {
    for (let i = items.length - 1; i >= 0; i -= 1) {
      const value = pick(items[i]);
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }
    return undefined;
  };

  // --- MRR (overview + evolution) ---
  const mrrEvolution = useMemo(
    () =>
      overview?.mrr?.evolution ??
      (overviewAny?.evolution_mrr as
        | Array<{ month?: string; mois?: string; mrr: number }>
        | undefined) ??
      [],
    [overview, overviewAny],
  );
  // Prefer evolution API for current MRR value
  const lastEvoValue = getLastFiniteValue(evolutionItems, (item) => item.value);
  const lastMrrValue = getLastFiniteValue(
    mrrEvolution as Array<{ mrr: number }>,
    (item) => item.mrr,
  );
  const mrrCurrent =
    lastEvoValue ??
    lastMrrValue ??
    (overviewAny?.mrr_current as number | undefined) ??
    0;

  const lastCompareEvoValue = getLastFiniteValue(
    compareEvolutionItems,
    (item) => item.value,
  );
  const lastCompareOverviewMrr = getLastFiniteValue(
    compareOverview?.mrr?.evolution ?? [],
    (item) => item.mrr,
  );

  const mrrPrevious =
    lastCompareEvoValue ??
    lastCompareOverviewMrr ??
    (compareOverviewAny?.mrr_current as number | undefined) ??
    undefined;

  // --- Churn 90j (overview) ---
  const churnValue =
    overview?.churn_90j?.valeur ??
    (overviewAny?.gross_churn as number | undefined) ??
    0;
  const churnPrevious =
    compareOverview?.churn_90j?.valeur ??
    (compareOverviewAny?.gross_churn as number | undefined) ??
    undefined;

  const churnParCohorte = useMemo(
    () => overview?.churn_90j?.par_cohorte ?? [],
    [overview],
  );

  // --- ARPA (overview) ---
  const arpaValue =
    overview?.arpa?.valeur ??
    (overviewAny?.arpa_current as number | undefined) ??
    0;
  const arpaPrevious =
    compareOverview?.arpa?.valeur ??
    (compareOverviewAny?.arpa_current as number | undefined) ??
    undefined;

  const arpaParPack = useMemo(() => overview?.arpa?.par_pack ?? [], [overview]);

  const actifsContracts = overview?.abonnements?.nombre_actif ?? 0;

  const upsellValue = overview?.abonnements?.upsell ?? 0;

  const actifsContractsPrevious = compareOverview?.abonnements?.nombre_actif;

  const upsellValuePrevious = compareOverview?.abonnements?.upsell;

  // --- Abonnements (overview) ---
  // const abonnementsActifs =
  //   overview?.abonnements?.nombre_actif ?? mockData.abonnements_actifs.current;
  // const upsellValue = overview?.abonnements?.upsell ?? 0;

  // --- Chart data (evolution API prioritaire) ---
  const mrrChartData = useMemo(
    () =>
      evolutionItems.length
        ? evolutionItems.map((item) => ({
            rawMonth: item.month,
            month: item.month.substring(0, 3),
            mrr: item.value,
          }))
        : mrrEvolution.length
          ? mrrEvolution.map((item) => ({
              rawMonth: item.mois || item.month || "",
              month: (item.mois || item.month || "").substring(0, 3),
              mrr: item.mrr,
            }))
          : [],
    [evolutionItems, mrrEvolution],
  );

  const mrrTableData = useMemo(
    () =>
      evolutionItems.length
        ? evolutionItems.map((item) => ({
            month: item.month,
            value: item.value,
            clients_count: item.clients_count,
          }))
        : mrrEvolution.length
          ? mrrEvolution.map((item) => ({
              month: item.mois || item.month || "",
              value: item.mrr,
            }))
          : [],
    [evolutionItems, mrrEvolution],
  );

  // Highlight periods where month is outside selected filter period.
  const inactiveRanges = useMemo(() => {
    if (!mrrChartData.length) return [];

    const parseMonthKey = (value: string): number | undefined => {
      if (!value) return undefined;

      const yymmMatch = value.match(/^(\d{4})-(\d{2})/);
      if (yymmMatch) {
        const year = Number(yymmMatch[1]);
        const month = Number(yymmMatch[2]);
        if (Number.isFinite(year) && month >= 1 && month <= 12) {
          return year * 100 + month;
        }
      }

      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return undefined;
      }

      return parsed.getFullYear() * 100 + (parsed.getMonth() + 1);
    };

    const periodStartKey =
      filters.period.start.getFullYear() * 100 +
      (filters.period.start.getMonth() + 1);
    const periodEndKey =
      filters.period.end.getFullYear() * 100 +
      (filters.period.end.getMonth() + 1);

    const ranges: { start: string; end: string }[] = [];
    let currentStart: string | null = null;

    mrrChartData.forEach((point, index) => {
      const pointDate = parseMonthKey(point.rawMonth);
      const isInactive =
        !!pointDate && (pointDate < periodStartKey || pointDate > periodEndKey);

      if (isInactive) {
        if (!currentStart) {
          currentStart = point.month;
        }

        if (index === mrrChartData.length - 1 && currentStart) {
          ranges.push({ start: currentStart, end: point.month });
        }
      } else if (currentStart) {
        const previousPoint = mrrChartData[index - 1];
        ranges.push({ start: currentStart, end: previousPoint.month });
        currentStart = null;
      }
    });

    return ranges;
  }, [mrrChartData, filters.period.end, filters.period.start]);

  const churnPieData = useMemo(
    () => [
      {
        name: "Actifs",
        value: +(100 - churnValue).toFixed(1),
        color: "hsl(145, 45%, 35%)",
      },
      {
        name: "Churn 90j",
        value: +churnValue.toFixed(1),
        color: "hsl(0, 72%, 51%)",
      },
    ],
    [churnValue],
  );

  const churnTableData = useMemo(() => churnParCohorte, [churnParCohorte]);

  const arpaTableData = useMemo(() => arpaParPack, [arpaParPack]);

  // Show skeleton while loading or fetching (includes filter changes)
  if (isLoading || isFetching) {
    return <UniverseViewSkeleton />;
  }

  // Keep empty until dedicated API endpoints are wired.
  const serviceTableData: Array<Record<string, string | number>> = [];
  const activationTableData: Array<Record<string, string | number>> = [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview section */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Zap className="h-6 w-6 text-segment-pp" />
          Plug & Play – KPIs Clés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BaseKpiCard
            label="MRR"
            value={formatPrice(mrrCurrent)}
            previousValue={getPreviousCurrencyValue(mrrPrevious)}
            trend={getTrend(mrrCurrent, mrrPrevious)}
            icon={<Euro className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            isLoading={isLoadingOverview || isLoadingEvolution}
            tableTitle="Évolution MRR"
            tableColumns={[
              { key: "month", label: "Mois" },
              {
                key: "value",
                label: "MRR",
                format: (v) => formatPrice(v),
              },
              { key: "clients_count", label: "Clients" },
            ]}
            tableData={mrrTableData}
          />
          <BaseKpiCard
            label="Churn 90 jours"
            value={`${churnValue}%`}
            previousValue={getPreviousValue(churnPrevious, "%")}
            trend={getTrend(churnValue, churnPrevious)}
            icon={<TrendingDown className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            isLoading={isLoadingOverview}
            tableTitle="Analyse churn par cohorte"
            tableColumns={[
              { key: "cohorte", label: "Cohorte" },
              { key: "inscrits", label: "Inscrits" },
              { key: "actifs90j", label: "Actifs 90j" },
              { key: "churns", label: "Churns" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={churnTableData}
          />
          <BaseKpiCard
            label="ARPA"
            value={formatPrice(arpaValue)}
            previousValue={getPreviousCurrencyValue(arpaPrevious)}
            trend={getTrend(arpaValue, arpaPrevious)}
            icon={<Target className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            isLoading={isLoadingOverview}
            tableTitle="ARPA par pack"
            tableColumns={[
              { key: "pack", label: "Pack" },
              { key: "clients", label: "Clients" },
              { key: "arpa", label: "ARPA", format: (v) => formatPrice(v) },
              { key: "part", label: "Part" },
            ]}
            tableData={arpaTableData}
          />
          {/* TODO: Dynamiser quand l'API sera prête */}
          <BaseKpiCard
            label="Contrats actifs"
            value={actifsContracts.toString()}
            previousValue={getPreviousValue(actifsContractsPrevious)}
            trend={getTrend(actifsContracts, actifsContractsPrevious)}
            icon={<HeadphonesIcon className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            isLoading={isLoadingOverview}
            tableTitle="Coûts service par type"
            tableColumns={[
              { key: "type", label: "Type" },
              { key: "tickets", label: "Tickets" },
              {
                key: "coutMoyen",
                label: "Coût moy.",
                format: (v) => formatPrice(v),
              },
              { key: "total", label: "Total", format: (v) => formatPrice(v) },
            ]}
            tableData={serviceTableData}
          />
          {/* TODO: Dynamiser quand l'API sera prête */}
          <BaseKpiCard
            label="Upsell"
            value={`${upsellValue}%`}
            previousValue={getPreviousValue(upsellValuePrevious, "%")}
            trend={getTrend(upsellValue, upsellValuePrevious)}
            icon={<Zap className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            isLoading={isLoadingOverview}
            tableTitle="Activation par semaine"
            tableColumns={[
              { key: "semaine", label: "Semaine" },
              { key: "inscrits", label: "Inscrits" },
              { key: "actives", label: "Activés" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={activationTableData}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Evolution chart section */}
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setMrrModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Évolution MRR</h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mrrChartData}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(35, 85%, 50%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(35, 85%, 50%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                tickFormatter={(value) => formatPrice(Number(value || 0))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [formatPrice(value || 0), "MRR"]}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="hsl(35, 85%, 50%)"
                fillOpacity={1}
                fill="url(#colorMrr)"
                strokeWidth={2}
              />
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

        {/* Churn section */}
        {/* <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setChurnModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Rétention à 90 jours</h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={churnPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {churnPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(40, 25%, 99%)",
                    border: "1px solid hsl(35, 20%, 88%)",
                    borderRadius: "0.75rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>

      {/* Product section */}
      {/* <div>
        <h3 className="text-lg font-semibold mb-4">Tunnel & Usage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SimpleKpiCard
            label="Abonnements actifs"
            value={`${abonnementsActifs}`}
            trend={mockData.abonnements_actifs.trend}
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Répartition abonnements"
            tableColumns={[
              { key: "pack", label: "Pack" },
              { key: "actifs", label: "Actifs" },
              { key: "part", label: "Part" },
            ]}
            tableData={[
              { pack: "Starter", actifs: 85, part: "36%" },
              { pack: "Business", actifs: 112, part: "47%" },
              { pack: "Premium", actifs: 40, part: "17%" },
            ]}
          />
          <SimpleKpiCard
            label="Tasses / client / mois"
            value={`${mockData.tasses_client_mois.current}`}
            trend={mockData.tasses_client_mois.trend}
            icon={<Coffee className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Consommation par pack"
            tableColumns={[
              { key: "pack", label: "Pack" },
              { key: "moyenne", label: "Moy. tasses" },
              { key: "incluses", label: "Incluses" },
            ]}
            tableData={[
              { pack: "Starter", moyenne: 280, incluses: 300 },
              { pack: "Business", moyenne: 450, incluses: 500 },
              { pack: "Premium", moyenne: 680, incluses: 800 },
            ]}
          />
          <SimpleKpiCard
            label="Délai installation"
            value={mockData.delai_installation.current}
            trend={mockData.delai_installation.trend}
            trendLabel="amélioration"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Délais par région"
            tableColumns={[
              { key: "region", label: "Région" },
              { key: "delai", label: "Délai moy." },
              { key: "installations", label: "Installations" },
            ]}
            tableData={[
              {
                region: "Île-de-France",
                delai: "2.5 jours",
                installations: 35,
              },
              {
                region: "Lyon/Marseille",
                delai: "3.0 jours",
                installations: 22,
              },
              { region: "Autres", delai: "4.2 jours", installations: 18 },
            ]}
          />
          <SimpleKpiCard
            label="Taux upsell"
            value={
              upsellValue ? `${upsellValue}%` : mockData.taux_upsell.current
            }
            trend={mockData.taux_upsell.trend}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Upsells par type"
            tableColumns={[
              { key: "type", label: "Type upsell" },
              { key: "nombre", label: "Nombre" },
              { key: "revenus", label: "Revenus add.", format: (v) => `${v}€` },
            ]}
            tableData={[
              { type: "Pack supérieur", nombre: 28, revenus: 1960 },
              { type: "Options machine", nombre: 15, revenus: 750 },
              { type: "Cafés premium", nombre: 42, revenus: 840 },
            ]}
          />
        </div>
      </div> */}

      {/* Modals */}
      <DataTableModal
        open={mrrModalOpen}
        onOpenChange={setMrrModalOpen}
        title="Données MRR"
        columns={[
          { key: "month", label: "Mois" },
          {
            key: "mrr",
            label: "MRR",
            format: (v) => formatPrice(v),
          },
        ]}
        data={mrrChartData}
        variant="pp"
      />
      <DataTableModal
        open={churnModalOpen}
        onOpenChange={setChurnModalOpen}
        title="Données rétention"
        columns={[
          { key: "name", label: "Statut" },
          { key: "value", label: "Pourcentage", format: (v) => `${v}%` },
        ]}
        data={churnPieData}
        variant="pp"
      />
    </div>
  );
}
