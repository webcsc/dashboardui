import { useModalState } from "@/hooks/useModalState";
import { useMemo, useState, useEffect } from "react";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { Coffee, Bean, Package, Droplets } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  DefaultTooltipContent,
} from "recharts";
import type { FilterState } from "@/types";
import {
  useOverview,
  useEvolution,
  useDistribution,
  useProducts,
} from "@/hooks/useDashboardData";
import { useViewFilters, useComparisonHelpers } from "@/hooks";
import {
  transformDistributionData,
  transformEvolutionData,
  groupDistributionData,
} from "@/lib/dashboard-utils";
import { DataTableModal } from "../modals/DataTableModal";
import { Switch } from "@/components/ui/switch";
import { formatPrice, formatWeight } from "@/lib";
import { CafeMonthData, DistributionItem } from "@/services/dashboard-api";
import { UniverseViewSkeleton } from "../skeletons";
import { renderProductView } from "@/lib/product-view-helpers";

interface CafeViewProps {
  filters: FilterState;
  isComparing: boolean;
}

const COLORS = ["hsl(25, 60%, 35%)", "hsl(25, 45%, 50%)", "hsl(25, 35%, 65%)"];

export function CafeView({ filters, isComparing }: CafeViewProps) {
  // Modal state for client filter
  const [modalClientId, setModalClientId] = useState<string | undefined>();
  const { openModals, openModal, closeModal, isAnyOpen } = useModalState([
    "caTotal",
    "volumeTotal",
    "partB2B",
    "prixMoyen",
    "format",
    "evolution",
  ]);

  // Sync modal client filter with global filter when opening
  useEffect(() => {
    if (isAnyOpen) {
      setModalClientId(filters.clientId);
    }
  }, [isAnyOpen, filters.clientId]);

  // Use custom hooks for filters and comparison helpers
  const { modalFilters, comparisonFilters } = useViewFilters(
    filters,
    modalClientId,
  );
  const { getTrend, getPreviousValue, getPreviousCurrencyValue } =
    useComparisonHelpers(isComparing);

  // Fetch data specifically for modals (independent of main view)
  const { data: modalOverviewResponse } = useOverview("cafe", modalFilters, {
    enabled: isAnyOpen,
  });
  const { data: modalEvolutionResponse } = useEvolution<CafeMonthData>(
    "cafe",
    modalFilters,
    { enabled: isAnyOpen },
  );
  const {
    data: modalDistributionResponse,
    isFetching: isFetchingModalDistribution,
  } = useDistribution("cafe", modalFilters, { enabled: isAnyOpen });

  const modalOverview = modalOverviewResponse?.data;

  // Transform modal data
  const modalFormatData = useMemo(
    () => transformDistributionData(modalDistributionResponse?.distribution),
    [modalDistributionResponse],
  );

  const modalEvolutionData = useMemo(
    () =>
      transformEvolutionData(
        modalEvolutionResponse?.data,
        filters.period.start.getFullYear().toString(),
        12, // Limit to 12 months
        false, // includeFuture
        filters.period, // Pass period for highlighting
      ),
    [modalEvolutionResponse, filters.period],
  );

  // Fetch API Data
  const {
    data: overviewResponse,
    isLoading: isLoadingOverview,
    isFetching: isFetchingOverview,
  } = useOverview("cafe", filters);
  const {
    data: evolutionResponse,
    isLoading: isLoadingEvolution,
    isFetching: isFetchingEvolution,
  } = useEvolution<CafeMonthData>("cafe", filters);
  const {
    data: distributionResponse,
    isLoading: isLoadingDistribution,
    isFetching: isFetchingDistribution,
  } = useDistribution("cafe", filters);
  const { data: productsResponse } = useProducts("cafe", filters);

  // Volume switch state
  const [switchVolume, setSwitchVolume] = useState(false);
  const handleSwitchChange = () => {
    setSwitchVolume((e) => !e);
  };

  const { data: compareOverviewResponse } = useOverview(
    "cafe",
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );

  const { data: compareProductsResponse } = useProducts(
    "cafe",
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );

  const overview = overviewResponse?.data;
  const compareOverview = compareOverviewResponse?.data;
  const evolution = evolutionResponse?.data;
  const distribution = distributionResponse?.distribution;
  const compareProducts = compareProductsResponse?.products;
  const products = productsResponse?.products;

  // Transform Distribution Data
  const formatData = useMemo(() => {
    if (!distribution) return [];
    const baseData = Object.entries(distribution)
      .map(([key, item]: [string, DistributionItem]) => ({
        name: item.poid_unit ? formatWeight(Number(item.poid_unit)) : key,
        ca: item.ca_total_ht,
        volume: item.poids_total,
        part: Number(item.percentage_kg) || 0,
      }))
      .sort((a, b) => b.part - a.part);

    return groupDistributionData(baseData, 5);
  }, [distribution]);

  // Transform Evolution Data for Chart
  const currentYear = filters.period.start.getFullYear().toString();
  const isCurrentYear =
    filters.period.start.getFullYear() === new Date().getFullYear() &&
    filters.period.start.getMonth() === 0 &&
    filters.period.end.getMonth() === 11;

  const evolutionData = useMemo(
    () =>
      transformEvolutionData<CafeMonthData>(
        evolution,
        currentYear,
        12,
        isCurrentYear,
        filters.period,
      ),
    [evolution, currentYear, isCurrentYear, filters.period],
  );
  // KPI Values
  const caTotal = Number(overview?.ca_total_ht_global || 0) || 0;
  const volumeTotal = Number(overview?.volume_total_cafe || 0) || 0;
  const partB2B = Number(overview?.part_b2b || 0) || 0;
  const prixMoyen = Number(overview?.average_price_per_kg || 0) || 0;

  const caTotalPrev = compareOverview?.ca_total_ht_global;
  const volumeTotalPrev = compareOverview?.volume_total_global;
  const partB2BPrev = compareOverview?.part_b2b;
  const prixMoyenPrev = compareOverview?.average_price_per_kg;

  // Show skeleton while loading or fetching (includes filter changes)
  const isLoading =
    isLoadingOverview || isLoadingEvolution || isLoadingDistribution;
  const isFetching =
    isFetchingOverview || isFetchingEvolution || isFetchingDistribution;
  if (isLoading || isFetching || !overview || !evolution || !distribution) {
    return <UniverseViewSkeleton />;
  }

  const renderCustomBarCell = () => {
    return evolutionData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={entry.actif === 1 ? "hsl(25, 60%, 35%)" : "hsl(25, 35%, 65%)"}
      />
    ));
  };
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs globaux */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Coffee className="h-6 w-6 text-universe-cafe" />
          Univers Café – Vue d'ensemble
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BaseKpiCard
            label="CA Total"
            value={formatPrice(caTotal)}
            previousValue={getPreviousCurrencyValue(caTotalPrev)}
            trend={getTrend(caTotal, caTotalPrev)}
            icon={<Coffee className="h-5 w-5 text-universe-cafe" />}
            showComparison={isComparing}
            onClick={() => openModal("caTotal")}
          />
          <BaseKpiCard
            label="Volume Total"
            value={`${formatWeight(volumeTotal)}`}
            previousValue={
              isComparing && volumeTotalPrev !== undefined
                ? `${formatWeight(volumeTotalPrev)}`
                : "-"
            }
            trend={getTrend(volumeTotal, volumeTotalPrev)}
            icon={<Package className="h-5 w-5 text-universe-cafe" />}
            showComparison={isComparing}
            onClick={() => openModal("volumeTotal")}
          />
          <BaseKpiCard
            label="Part B2B"
            value={`${partB2B}%`}
            previousValue={getPreviousValue(partB2BPrev, "%")}
            trend={getTrend(partB2B, Number(partB2BPrev))}
            icon={<Bean className="h-5 w-5 text-universe-cafe" />}
            showComparison={isComparing}
            // onClick={() => openModal('partB2B')}
          />
          <BaseKpiCard
            label="Prix moyen / kg"
            value={formatPrice(prixMoyen || 0)}
            previousValue={
              isComparing && typeof prixMoyenPrev === "number"
                ? formatPrice(prixMoyenPrev)
                : "-"
            }
            trend={getTrend(prixMoyen, Number(prixMoyenPrev))}
            icon={<Droplets className="h-5 w-5 text-universe-cafe" />}
            showComparison={isComparing}
            // onClick={() => openModal('prixMoyen')}
          />
        </div>
      </div>

      {/* Graphiques répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openModal("format")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Répartition par Format</h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={formatData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, part }) => `${name} : ${part}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="part"
              >
                {formatData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openModal("evolution")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Évolution Mensuelle</h3>
            <label
              htmlFor="switch-volume"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              CA
              <Switch
                id="switch-volume"
                name="switch-volume"
                className="data-[state=unchecked]:bg-primary"
                onClick={handleSwitchChange}
              />
              Volume
            </label>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="mois" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                tickFormatter={(v) =>
                  switchVolume
                    ? evolutionData.some((i) => i.volume > 1000)
                      ? formatWeight(v, 0)
                      : formatWeight(v)
                    : v >= 1000
                      ? `${(v / 1000).toFixed(0)}k`
                      : v.toFixed(0)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                content={({ payload, ...props }) => {
                  if (!payload || payload.length === 0) return null;
                  if (payload.every((p) => !p.value || p.value === 0))
                    return null;
                  return <DefaultTooltipContent payload={payload} {...props} />;
                }}
                formatter={(value: number, name: string) => {
                  if (name === "CA") {
                    return [formatPrice(value), "CA"];
                  }
                  return [formatWeight(value || 0), "Volume"];
                }}
              />
              <Legend />
              {switchVolume ? (
                <Bar
                  dataKey="volume"
                  name="Volume"
                  fill="hsl(25, 60%, 35%)"
                  radius={[4, 4, 0, 0]}
                >
                  {renderCustomBarCell()}
                </Bar>
              ) : (
                <Bar
                  dataKey="ca"
                  name="CA"
                  fill="hsl(25, 60%, 35%)"
                  radius={[4, 4, 0, 0]}
                >
                  {renderCustomBarCell()}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Products Section */}
      {renderProductView({
        products,
        compareProducts,
        isComparing,
        getTrend,
        variant: "cafe",
        matchKey: "type",
        mainLabel: "Type",
        clientId: modalClientId,
        onClientChange: setModalClientId,
        filters,
      })}

      {/* Modals */}
      <DataTableModal
        open={openModals.caTotal || false}
        onOpenChange={() => closeModal("caTotal")}
        title="Répartition CA Café"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        customFilters={[
          {
            label: "Type de CA",
            options: [
              { value: "cafe", label: "CA total café" },
              { value: "the_divers", label: "CA total thé et divers" },
            ],
          },
        ]}
        metadata={{
          ca_total_ht_cafe: Number(modalOverview?.ca_total_ht_cafe) || 0,
          volume_total_cafe: Number(modalOverview?.volume_total_cafe) || 0,
          ca_total_ht_global: Number(modalOverview?.ca_total_ht_global) || 0,
          part_b2b: Number(modalOverview?.part_b2b) || 0,
        }}
        onCustomFilterChange={(filterValues, metadata) => {
          const selectedType = filterValues["Type de CA"];

          if (!selectedType || selectedType === "all" || !metadata) {
            // Return default B2B/B2C breakdown
            return [
              {
                segment: "B2B",
                ca:
                  (metadata?.ca_total_ht_global || 0) *
                  ((metadata?.part_b2b || 0) / 100),
                part: `${(metadata?.part_b2b || 0).toFixed(1)}%`,
              },
              {
                segment: "B2C / Particuliers",
                ca:
                  (metadata?.ca_total_ht_global || 0) *
                  (1 - (metadata?.part_b2b || 0) / 100),
                part: `${(100 - (metadata?.part_b2b || 0)).toFixed(1)}%`,
              },
            ];
          }

          if (selectedType === "cafe") {
            // Show CA breakdown for café specifically
            const caCafe = metadata.ca_total_ht_cafe || 0;
            return [
              {
                segment: "CA Café B2B",
                ca: caCafe * ((metadata?.part_b2b || 0) / 100),
                part: `${(metadata?.part_b2b || 0).toFixed(1)}%`,
              },
              {
                segment: "CA Café B2C",
                ca: caCafe * (1 - (metadata?.part_b2b || 0) / 100),
                part: `${(100 - (metadata?.part_b2b || 0)).toFixed(1)}%`,
              },
            ];
          }

          if (selectedType === "the_divers") {
            // Show CA breakdown for thé et divers (global - café)
            const caTheDivers =
              (metadata?.ca_total_ht_global || 0) -
              (metadata?.ca_total_ht_cafe || 0);
            return [
              {
                segment: "CA Thé et Divers B2B",
                ca: caTheDivers * ((metadata?.part_b2b || 0) / 100),
                part: `${(metadata?.part_b2b || 0).toFixed(1)}%`,
              },
              {
                segment: "CA Thé et Divers B2C",
                ca: caTheDivers * (1 - (metadata?.part_b2b || 0) / 100),
                part: `${(100 - (metadata?.part_b2b || 0)).toFixed(1)}%`,
              },
            ];
          }

          return [];
        }}
        columns={[
          { key: "segment", label: "Segment" },
          {
            key: "ca",
            label: "CA",
            format: (v) => formatPrice(v),
          },
          { key: "part", label: "Part" },
        ]}
        data={[
          {
            segment: "B2B",
            ca:
              (Number(modalOverview?.ca_total_ht_global) || 0) *
              ((Number(modalOverview?.part_b2b) || 0) / 100),
            part: `${(Number(modalOverview?.part_b2b) || 0).toFixed(1)}%`,
          },
          {
            segment: "B2C / Particuliers",
            ca:
              (Number(modalOverview?.ca_total_ht_global) || 0) *
              (1 - (Number(modalOverview?.part_b2b) || 0) / 100),
            part: `${(100 - (Number(modalOverview?.part_b2b) || 0)).toFixed(1)}%`,
          },
        ]}
        variant="cafe"
        isLoading={isFetchingModalDistribution}
      />
      <DataTableModal
        open={openModals.volumeTotal || false}
        onOpenChange={() => closeModal("volumeTotal")}
        title="Répartition Volume"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "segment", label: "Segment" },
          {
            key: "volume",
            label: "Volume (kg)",
            format: (v) => (v || 0).toFixed(0),
          },
          { key: "part", label: "Part" },
        ]}
        data={[
          {
            segment: "B2B",
            volume:
              (Number(modalOverview?.volume_total_global) || 0) *
              ((Number(modalOverview?.part_b2b) || 0) / 100),
            part: `${(Number(modalOverview?.part_b2b) || 0).toFixed(1)}%`,
          },
          {
            segment: "B2C / Particuliers",
            volume:
              (Number(modalOverview?.volume_total_global) || 0) *
              (1 - (Number(modalOverview?.part_b2b) || 0) / 100),
            part: `${(100 - (Number(modalOverview?.part_b2b) || 0)).toFixed(1)}%`,
          },
        ]}
        variant="cafe"
        isLoading={isFetchingModalDistribution}
      />
      <DataTableModal
        open={openModals.partB2B || false}
        onOpenChange={() => closeModal("partB2B")}
        title="Évolution B2B/B2C"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "mois", label: "Mois" },
          { key: "b2b", label: "B2B %" },
          { key: "b2c", label: "B2C %" },
        ]}
        data={
          evolutionData.length > 0
            ? evolutionData.map((item) => {
                const monthKey = Object.keys(
                  evolution?.[currentYear] || {},
                ).find(
                  (k) =>
                    k.startsWith(item.mois) ||
                    item.mois.startsWith(k.substring(0, 3)),
                );
                const rawMonth = monthKey
                  ? evolution[currentYear][monthKey]
                  : null;
                const val = rawMonth?.part_b2b | 100 | 0;
                return {
                  mois: item.mois,
                  b2b: `${(val || 0).toFixed(1)}%`,
                  b2c: `${(100 - (val || 0)).toFixed(1)}%`,
                };
              })
            : []
        }
        variant="cafe"
        isLoading={isFetchingModalDistribution}
      />
      <DataTableModal
        open={openModals.prixMoyen || false}
        onOpenChange={() => closeModal("prixMoyen")}
        title="Prix moyen par format"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "format", label: "Format" },
          { key: "prix", label: "Prix/kg", format: (v) => formatPrice(v) },
        ]}
        data={[
          {
            format: "Prix Moyen Global",
            prix: modalOverview?.average_price_per_kg || 0,
          },
        ]}
        variant="cafe"
        isLoading={isFetchingModalDistribution}
      />
      <DataTableModal
        open={openModals.format || false}
        onOpenChange={() => closeModal("format")}
        title="Répartition par Format"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "name", label: "Format" },
          {
            key: "ca",
            label: "CA",
            format: (v) => formatPrice(v),
          },
          { key: "volume", label: "Volume (kg)" },
          { key: "part", label: "Part", format: (v) => `${v.toFixed(1)}%` },
        ]}
        data={modalFormatData}
        variant="cafe"
        isLoading={isFetchingModalDistribution}
      />
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal("evolution")}
        title="Évolution Mensuelle Café"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "mois", label: "Mois" },
          {
            key: "ca",
            label: "CA",
            format: (v) => formatPrice(v),
          },
          { key: "volume", label: "Volume (kg)" },
        ]}
        data={modalEvolutionData}
        variant="cafe"
        isLoading={isFetchingModalDistribution}
      />
    </div>
  );
}
