import { useMemo, useState } from "react";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { Building2, Users, Euro, Target } from "lucide-react";
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
  useKpiStrategiqueOverviewGrandsComptes,
  useKpiStrategiqueEvolutionGrandsComptes,
} from "@/hooks/useDashboardData";
import { useViewFilters, useComparisonHelpers } from "@/hooks";
import { UniverseViewSkeleton } from "../skeletons";
import { formatPrice } from "@/lib";

interface GrandsComptesViewProps {
  filters: FilterState;
  isComparing: boolean;
}

export function GrandsComptesView({
  filters,
  isComparing,
}: GrandsComptesViewProps) {
  const [arrModalOpen, setArrModalOpen] = useState(false);
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(false);

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
  } = useKpiStrategiqueOverviewGrandsComptes(mainFilters);
  const {
    data: evolutionData,
    isLoading: isLoadingEvolution,
    isFetching: isFetchingEvolution,
  } = useKpiStrategiqueEvolutionGrandsComptes(mainFilters);

  // Comparison data
  const { data: compareOverviewData } = useKpiStrategiqueOverviewGrandsComptes(
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );
  const { data: compareEvolutionData } =
    useKpiStrategiqueEvolutionGrandsComptes(comparisonFilters, {
      enabled: isComparing && !!filters.comparePeriod,
    });

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

  // --- ARR ---
  const arrEvolution = useMemo(
    () =>
      overview?.arr?.evolution ??
      (overviewAny?.evolution_arr as
        | Array<{ month: string; arr: number; clients?: number }>
        | undefined) ??
      [],
    [overview, overviewAny],
  );
  // Use evolution API for current ARR value
  const lastEvoValue = getLastFiniteValue(evolutionItems, (item) => item.value);
  const lastArrValue = getLastFiniteValue(arrEvolution, (item) => item.arr);
  const arrCurrent =
    lastEvoValue ??
    lastArrValue ??
    (overviewAny?.arr_current as number | undefined) ??
    0;
  const lastCompareEvoValue = getLastFiniteValue(
    compareEvolutionItems,
    (item) => item.value,
  );
  const lastCompareOverviewArr = getLastFiniteValue(
    compareOverview?.arr?.evolution ?? [],
    (item) => item.arr,
  );
  const arrPrevious =
    lastCompareEvoValue ??
    lastCompareOverviewArr ??
    (compareOverviewAny?.arr_current as number | undefined) ??
    undefined;

  const nombreAbonnementEtudeCasCurrent = overview?.contrats?.etude_cas ?? 0;
  const nombreAbonnementEtudeCasPrevious = compareOverview?.contrats?.etude_cas;

  // --- Données graphique & table ARR (evolution API) ---
  const revenueData = useMemo(
    () =>
      evolutionItems.length
        ? evolutionItems.map((item) => ({
            rawMonth: item.month,
            month: item.month.substring(0, 3),
            arr: item.value,
          }))
        : arrEvolution.length
          ? arrEvolution.map((item) => ({
              rawMonth: item.month,
              month: item.month.substring(0, 3),
              arr: item.arr,
            }))
          : [],
    [evolutionItems, arrEvolution],
  );

  const arrTableData = useMemo(
    () =>
      evolutionItems.length
        ? evolutionItems.map((item) => ({
            month: item.month,
            arr: item.value,
            clients: item.clients_count,
          }))
        : arrEvolution.length
          ? arrEvolution.map((item) => ({
              month: item.month,
              arr: item.arr,
              clients: item.clients,
            }))
          : [],
    [evolutionItems, arrEvolution],
  );

  // Highlight periods where month is outside selected filter period.
  const inactiveRanges = useMemo(() => {
    if (!revenueData.length) return [];

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

    revenueData.forEach((point, index) => {
      const pointDate = parseMonthKey(point.rawMonth);
      const isInactive =
        !!pointDate && (pointDate < periodStartKey || pointDate > periodEndKey);

      if (isInactive) {
        if (!currentStart) {
          currentStart = point.month;
        }

        if (index === revenueData.length - 1 && currentStart) {
          ranges.push({ start: currentStart, end: point.month });
        }
      } else if (currentStart) {
        const previousPoint = revenueData[index - 1];
        ranges.push({ start: currentStart, end: previousPoint.month });
        currentStart = null;
      }
    });

    return ranges;
  }, [filters.period.end, filters.period.start, revenueData]);
  const clientsCount =
    overview?.clients?.count ??
    (overviewAny?.nombre_clients_end as number | undefined) ??
    0;
  const compareClientsCount =
    compareOverview?.clients?.count ??
    (compareOverviewAny?.nombre_clients_end as number | undefined);

  // --- Adoption interne ---
  const adoptionParClient = useMemo(
    () =>
      overview?.adoption_interne?.par_client ??
      (overviewAny?.adoption_par_client as
        | Array<{
            client: string;
            collaborateurs: number;
            actifs: number;
            taux: string | number;
          }>
        | undefined) ??
      [],
    [overview, overviewAny],
  );

  // --- Marge ---
  const margeDetails = useMemo(
    () => overview?.marge_client?.details ?? [],
    [overview],
  );
  const margeCurrent = margeDetails.length
    ? parseFloat(margeDetails[0].tauxMarge.replace("%", ""))
    : ((overviewAny?.marge as number | undefined) ?? 0);
  const compareMargeDetails = compareOverview?.marge_client?.details ?? [];
  const margePrevious = compareMargeDetails.length
    ? parseFloat(compareMargeDetails[0].tauxMarge.replace("%", ""))
    : ((compareOverviewAny?.marge as number | undefined) ?? undefined);

  // --- OCOC ---
  const ococCurrent = overview?.ococ_client?.valeur ?? 0;
  const ococPrevious = compareOverview?.ococ_client?.valeur;

  // --- Données table adoption ---
  const adoptionTableData = useMemo(
    () => adoptionParClient,
    [adoptionParClient],
  );

  const adoptionData = useMemo(
    () =>
      adoptionTableData.map((item) => ({
        client: item.client,
        taux: parseFloat(String(item.taux).replace("%", "")) || 0,
      })),
    [adoptionTableData],
  );

  // --- Données table marge ---
  const margeTableData = useMemo(() => margeDetails, [margeDetails]);

  // Show skeleton while loading or fetching (includes filter changes)
  if (isLoading || isFetching) {
    return <UniverseViewSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs prioritaires */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Building2 className="h-6 w-6 text-segment-gc" />
          Grands Comptes – KPIs Clés
        </h2>
        {/* Overview section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BaseKpiCard
            label="ARR"
            value={formatPrice(arrCurrent)}
            previousValue={getPreviousCurrencyValue(arrPrevious)}
            trend={getTrend(arrCurrent, arrPrevious)}
            icon={<Euro className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Évolution ARR"
            tableColumns={[
              { key: "month", label: "Mois" },
              {
                key: "arr",
                label: "ARR",
                format: (v) => formatPrice(v),
              },
              { key: "clients", label: "Clients" },
            ]}
            tableData={arrTableData}
            isLoading={isLoadingOverview || isLoadingEvolution}
          />
          <BaseKpiCard
            label="Clients"
            value={`${clientsCount}`}
            previousValue={getPreviousValue(compareClientsCount)}
            trend={getTrend(clientsCount, compareClientsCount)}
            icon={<Users className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            isLoading={isLoadingOverview}
          />
          <BaseKpiCard
            label="Étude de cas"
            value={nombreAbonnementEtudeCasCurrent.toString()}
            previousValue={getPreviousValue(nombreAbonnementEtudeCasPrevious)}
            trend={getTrend(
              nombreAbonnementEtudeCasCurrent,
              nombreAbonnementEtudeCasPrevious,
            )}
            icon={<Users className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Étude de cas par client"
            tableColumns={[
              { key: "client", label: "Client" },
              { key: "collaborateurs", label: "Collaborateurs" },
              { key: "actifs", label: "Actifs" },
              { key: "taux", label: "Taux" },
            ]}
            // tableData={adoptionTableData}
            isLoading={isLoadingOverview}
          />
          <BaseKpiCard
            label="Marge / client"
            value={`${margeCurrent.toFixed(2)}%`}
            previousValue={getPreviousValue(margePrevious, "%")}
            trend={getTrend(margeCurrent, margePrevious)}
            icon={<Target className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Marge par client"
            tableColumns={[
              { key: "client", label: "Client" },
              {
                key: "ca",
                label: "CA",
                format: (v) => formatPrice(v),
              },
              {
                key: "marge",
                label: "Marge",
                format: (v) => formatPrice(v),
              },
              { key: "tauxMarge", label: "Taux" },
            ]}
            tableData={margeTableData}
            isLoading={isLoadingOverview}
          />
          <BaseKpiCard
            label="€ OCOC / client"
            value={formatPrice(ococCurrent)}
            previousValue={getPreviousCurrencyValue(ococPrevious)}
            trend={getTrend(ococCurrent, ococPrevious)}
            icon={<Building2 className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            isLoading={isLoadingOverview}
          />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Evolution chart section */}
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setArrModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Évolution ARR</h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(220, 55%, 35%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(220, 55%, 35%)"
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
                formatter={(value: number) => [formatPrice(value || 0), "ARR"]}
              />
              <Area
                type="monotone"
                dataKey="arr"
                stroke="hsl(220, 55%, 35%)"
                fillOpacity={1}
                fill="url(#colorArr)"
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
        {/* <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setAdoptionModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Taux d'adoption par client
            </h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={adoptionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
              />
              <YAxis
                dataKey="client"
                type="category"
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [`${value}%`, "Adoption"]}
              />
              <Bar
                dataKey="taux"
                fill="hsl(220, 55%, 35%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      {/* Products section */}
      {/* <div>
        <h3 className="text-lg font-semibold mb-4">Opérations & Marketing</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SimpleKpiCard
            label="Sites actifs"
            value="47"
            trend={4}
            icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Sites actifs par région"
            tableColumns={[
              { key: "region", label: "Région" },
              { key: "sites", label: "Sites" },
              {
                key: "tasses",
                label: "Tasses/mois",
                format: (v) => (v || 0).toLocaleString(),
              },
            ]}
            tableData={[
              { region: "Île-de-France", sites: 18, tasses: 72000 },
              { region: "Auvergne-Rhône-Alpes", sites: 8, tasses: 28000 },
              { region: "PACA", sites: 6, tasses: 22000 },
              { region: "Hauts-de-France", sites: 5, tasses: 18000 },
              { region: "Autres", sites: 10, tasses: 38000 },
            ]}
          />
          <SimpleKpiCard
            label="SLA respectés"
            value="94%"
            trend={2.1}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Respect SLA par type"
            tableColumns={[
              { key: "type", label: "Type intervention" },
              { key: "total", label: "Total" },
              { key: "respectes", label: "Respectés" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={[
              {
                type: "Maintenance préventive",
                total: 120,
                respectes: 118,
                taux: "98%",
              },
              {
                type: "Dépannage urgent",
                total: 45,
                respectes: 40,
                taux: "89%",
              },
              { type: "Installation", total: 8, respectes: 8, taux: "100%" },
              { type: "Réassort", total: 180, respectes: 168, taux: "93%" },
            ]}
          />
          <SimpleKpiCard
            label="Cycle de vente"
            value="68 jours"
            trend={-12}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Pipeline commercial"
            tableColumns={[
              { key: "etape", label: "Étape" },
              { key: "deals", label: "Deals" },
              { key: "duree", label: "Durée moy." },
            ]}
            tableData={[
              { etape: "Lead qualifié", deals: 24, duree: "0 jours" },
              { etape: "Premier RDV", deals: 18, duree: "8 jours" },
              { etape: "Proposition", deals: 12, duree: "25 jours" },
              { etape: "Négociation", deals: 8, duree: "52 jours" },
              { etape: "Closing", deals: 5, duree: "68 jours" },
            ]}
          />
          <SimpleKpiCard
            label="Études de cas"
            value="12"
            trend={20}
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Études de cas publiées"
            tableColumns={[
              { key: "client", label: "Client" },
              { key: "secteur", label: "Secteur" },
              { key: "date", label: "Date" },
            ]}
            tableData={[
              { client: "TechCorp", secteur: "IT", date: "Jan 2024" },
              { client: "BankPlus", secteur: "Finance", date: "Fév 2024" },
              { client: "HealthFirst", secteur: "Santé", date: "Mar 2024" },
              {
                client: "RetailMax",
                secteur: "Distribution",
                date: "Avr 2024",
              },
            ]}
          />
        </div>
      </div> */}

      {/* Modals for charts */}
      <DataTableModal
        open={arrModalOpen}
        onOpenChange={setArrModalOpen}
        title="Données ARR"
        columns={[
          { key: "month", label: "Mois" },
          {
            key: "arr",
            label: "ARR",
            format: (v) => formatPrice(v),
          },
        ]}
        data={revenueData}
        variant="gc"
      />
      <DataTableModal
        open={adoptionModalOpen}
        onOpenChange={setAdoptionModalOpen}
        title="Taux d'adoption par client"
        columns={[
          { key: "client", label: "Client" },
          { key: "taux", label: "Taux d'adoption", format: (v) => `${v}%` },
        ]}
        data={adoptionData}
        variant="gc"
      />
    </div>
  );
}
