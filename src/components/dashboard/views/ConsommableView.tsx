import { useModalState } from "@/hooks/useModalState";
import { useMemo, useState, useEffect } from "react";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { Droplets, Package, Euro, Bean } from "lucide-react";
import { subMonths } from "date-fns";
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
  useProducts,
} from "@/hooks/useDashboardData";
import { useViewFilters, useComparisonHelpers } from "@/hooks";
import { transformEvolutionData } from "@/lib/dashboard-utils";
import { DataTableModal } from "../modals/DataTableModal";
import { formatPrice, formatWeight, getMonthDuration } from "@/lib";
import { CafeMonthData, ConsommableEvolution } from "@/services/dashboard-api";
import { UniverseViewSkeleton } from "../skeletons";
import { renderProductView } from "@/lib/product-view-helpers";

interface ConsommableViewProps {
  filters: FilterState;
  isComparing: boolean;
}

const COLORS = [
  "hsl(160, 50%, 40%)",
  "hsl(40, 70%, 50%)",
  "hsl(20, 60%, 45%)",
  "hsl(200, 50%, 50%)",
  "hsl(280, 40%, 50%)",
  "hsl(0, 0%, 60%)",
];

export function ConsommableView({
  filters,
  isComparing,
}: ConsommableViewProps) {
  // Modal state for client filter
  const [modalClientId, setModalClientId] = useState<string | undefined>();
  const { openModals, openModal, closeModal, isAnyOpen } = useModalState([
    "caTotal",
    "caThe",
    "caDivers",
    "nbRefs",
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

  // Fetch API Data
  const {
    data: overviewResponse,
    isLoading: isLoadingOverview,
    isFetching: isFetchingOverview,
  } = useOverview("consommable", filters);

  const evolutionLimit = useMemo(() => {
    if (!filters.period.start || !filters.period.end) return 12;
    return Math.max(
      12,
      getMonthDuration(filters.period.start, filters.period.end),
    );
  }, [filters.period]);

  const evolutionFilters = useMemo(() => {
    if (evolutionLimit > 12) return filters;
    const end = filters.period.end;
    const start = subMonths(end, 11);
    start.setDate(1);
    return { ...filters, period: { start, end } };
  }, [filters, evolutionLimit]);

  const {
    data: evolutionResponse,
    isLoading: isLoadingEvolution,
    isFetching: isFetchingEvolution,
  } = useEvolution<ConsommableEvolution>("consommable", evolutionFilters);

  const { data: productsResponse, isFetching: isFetchingProducts } =
    useProducts("consommable", filters);

  const { data: compareOverviewResponse } = useOverview(
    "consommable",
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );

  const { data: compareProductsResponse } = useProducts(
    "consommable",
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );

  // Fetch data specifically for modals (independent of main view)
  const { data: modalOverviewResponse } = useOverview(
    "consommable",
    modalFilters,
    {
      enabled: isAnyOpen,
    },
  );

  const modalEvolutionFilters = useMemo(() => {
    if (evolutionLimit > 12) return modalFilters;
    const end = modalFilters.period.end;
    const start = subMonths(end, 11);
    start.setDate(1);
    return { ...modalFilters, period: { start, end } };
  }, [modalFilters, evolutionLimit]);

  const { data: modalEvolutionResponse } = useEvolution<ConsommableEvolution>(
    "consommable",
    modalEvolutionFilters,
    { enabled: isAnyOpen },
  );

  // Data extraction
  const overview = overviewResponse?.data;
  const compareOverview = compareOverviewResponse?.data;
  const evolution = evolutionResponse?.data;
  const compareProducts = compareProductsResponse?.products;
  const products = productsResponse?.products;

  const currentYear = filters.period.start.getFullYear().toString();
  const isCurrentYear =
    filters.period.start.getFullYear() === new Date().getFullYear() &&
    filters.period.start.getMonth() === 0 &&
    filters.period.end.getMonth() === 11;

  // Transform Evolution Data for Chart
  const evolutionData = useMemo(
    () =>
      transformEvolutionData<ConsommableEvolution>(
        evolution,
        currentYear,
        evolutionLimit,
        isCurrentYear,
        filters.period,
        "consommable",
      ),
    [evolution, currentYear, evolutionLimit, isCurrentYear, filters.period],
  );

  const modalEvolutionData = useMemo(
    () =>
      transformEvolutionData(
        modalEvolutionResponse?.data,
        filters.period.start.getFullYear().toString(),
        evolutionLimit,
        false, // includeFuture
        filters.period, // Pass period for highlighting
        "consommable",
      ),
    [modalEvolutionResponse, filters.period, evolutionLimit],
  );

  const caTotal = Number(overview?.ca_total_ht_global || 0) || 0;
  const caTotalPrev = compareOverview?.ca_total_ht_global;

  // Calculate CA by category from products
  const caThe = useMemo(() => {
    if (!products || !products["Thés"]) return 0;
    return Object.values(products["Thés"]).reduce(
      (sum, p) => sum + Number(p.ca_total_ht || 0),
      0,
    );
  }, [products]);

  const caDivers = useMemo(() => {
    if (!products || !products["Divers (Sucre, Chocolat, Gobelets...)"])
      return 0;
    return Object.values(
      products["Divers (Sucre, Chocolat, Gobelets...)"],
    ).reduce((sum, p) => sum + Number(p.ca_total_ht || 0), 0);
  }, [products]);

  const caThePrev = useMemo(() => {
    if (!compareProducts || !compareProducts["Thés"]) return undefined;
    return Object.values(compareProducts["Thés"]).reduce(
      (sum, p) => sum + Number(p.ca_total_ht || 0),
      0,
    );
  }, [compareProducts]);

  const caDiversPrev = useMemo(() => {
    if (
      !compareProducts ||
      !compareProducts["Divers (Sucre, Chocolat, Gobelets...)"]
    )
      return undefined;
    return Object.values(
      compareProducts["Divers (Sucre, Chocolat, Gobelets...)"],
    ).reduce((sum, p) => sum + Number(p.ca_total_ht || 0), 0);
  }, [compareProducts]);

  const trendThe = getTrend(caThe, caThePrev);
  const trendDivers = getTrend(caDivers, caDiversPrev);

  // Helper to format table data for KPIs
  const theTableData = useMemo(() => {
    if (!products || !products["Thés"]) return [];
    return Object.entries(products["Thés"])
      .map(([name, p]) => ({
        marque: name,
        ca: p.ca_total_ht,
        volume: p.volume_total,
        part:
          caThe > 0 ? `${((p.ca_total_ht / caThe) * 100).toFixed(1)}%` : "0%",
      }))
      .sort((a, b) => b.ca - a.ca);
  }, [products, caThe]);

  const diversTableData = useMemo(() => {
    const key = "Divers (Sucre, Chocolat, Gobelets...)";
    if (!products || !products[key]) return [];
    const data = products[key];
    return Object.entries(data)
      .map(([name, p]) => ({
        categorie: name,
        ca: p.ca_total_ht,
        volume: p.volume_total,
        part:
          caDivers > 0
            ? `${((p.ca_total_ht / caDivers) * 100).toFixed(1)}%`
            : "0%",
      }))
      .sort((a, b) => b.ca - a.ca);
  }, [products, caDivers]);

  const nbRefs = overview?.count_product || 0;
  const nbRefsPrev = compareOverview?.count_product;

  const renderCustomBarCell = () => {
    return evolutionData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={entry.actif === 1 ? "hsl(160, 50%, 40%)" : "hsl(160, 30%, 65%)"}
      />
    ));
  };

  // Show skeleton while loading or fetching (includes filter changes)
  // MUST be called after all hooks to avoid "Rendered more hooks" error
  const isLoading =
    isLoadingOverview || isLoadingEvolution || !overview || !evolution;
  const isFetching =
    isFetchingOverview || isFetchingEvolution || isFetchingProducts;

  if (isLoading || isFetching) {
    return <UniverseViewSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs globaux */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Droplets className="h-6 w-6 text-universe-thedivers" />
          Univers Thé & Divers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BaseKpiCard
            label="CA Total"
            value={formatPrice(caTotal)}
            previousValue={getPreviousCurrencyValue(caTotalPrev)}
            trend={getTrend(caTotal, caTotalPrev)}
            icon={<Euro className="h-5 w-5 text-universe-thedivers" />}
            showComparison={isComparing}
            onClick={() => openModal("caTotal")}
          />
          <BaseKpiCard
            label="CA Thé"
            value={formatPrice(caThe)}
            previousValue={getPreviousCurrencyValue(caThePrev)}
            trend={trendThe}
            icon={<Droplets className="h-5 w-5 text-universe-thedivers" />}
            showComparison={isComparing}
            onClick={() => openModal("caThe")}
          />
          <BaseKpiCard
            label="CA Divers"
            value={formatPrice(caDivers)}
            previousValue={getPreviousCurrencyValue(caDiversPrev)}
            trend={trendDivers}
            icon={<Package className="h-5 w-5 text-universe-thedivers" />}
            showComparison={isComparing}
            onClick={() => openModal("caDivers")}
          />
          <BaseKpiCard
            label="Nb Références"
            value={nbRefs.toString()}
            previousValue={nbRefsPrev?.toString()}
            trend={getTrend(nbRefs, nbRefsPrev)}
            icon={<Bean className="h-5 w-5 text-universe-thedivers" />}
            showComparison={isComparing}
            onClick={() => openModal("nbRefs")}
          />
        </div>
      </div>

      {/* Evolution Chart */}
      <div
        className="chart-container cursor-pointer hover:shadow-lg transition-all"
        onClick={() => openModal("evolution")}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Évolution Mensuelle</h3>
          <span className="text-xs text-muted-foreground underline">
            Voir tableau
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
            <XAxis dataKey="mois" stroke="hsl(25, 15%, 45%)" fontSize={12} />
            <YAxis
              stroke="hsl(25, 15%, 45%)"
              fontSize={12}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)
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
            <Bar
              dataKey="ca"
              name="CA"
              fill="hsl(160, 50%, 40%)"
              radius={[4, 4, 0, 0]}
            >
              {renderCustomBarCell()}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Products Section */}
      {renderProductView({
        products,
        compareProducts,
        isComparing,
        getTrend,
        variant: "thedivers", // Use "thedivers" to get green theme
        matchKey: "type",
        mainLabel: "Univers",
        clientId: modalClientId,
        onClientChange: setModalClientId,
        filters,
      })}

      {/* Modals */}
      <DataTableModal
        open={openModals.caTotal || false}
        onOpenChange={() => closeModal("caTotal")}
        title="Répartition CA Consommable"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "categorie", label: "Catégorie" },
          {
            key: "ca",
            label: "CA",
            format: (v) => formatPrice(v),
          },
          { key: "part", label: "Part" },
        ]}
        data={[
          {
            categorie: "Thé",
            ca: caThe,
            part: `${caTotal > 0 ? Math.round((caThe / caTotal) * 100) : 0}%`,
          },
          {
            categorie: "Divers",
            ca: caDivers,
            part: `${caTotal > 0 ? Math.round((caDivers / caTotal) * 100) : 0}%`,
          },
        ]}
        variant="thedivers"
      />

      <DataTableModal
        open={openModals.caThe || false}
        onOpenChange={() => closeModal("caThe")}
        title="Détail Thé par marque"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "marque", label: "Marque" },
          {
            key: "ca",
            label: "CA",
            format: (v) => formatPrice(v),
          },
          {
            key: "volume",
            label: "Volume (g)",
            format: (v) => formatWeight(v),
          },
          { key: "part", label: "Part" },
        ]}
        data={theTableData}
        variant="thedivers"
      />

      <DataTableModal
        open={openModals.caDivers || false}
        onOpenChange={() => closeModal("caDivers")}
        title="Détail Divers"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "categorie", label: "Catégorie" },
          {
            key: "ca",
            label: "CA",
            format: (v) => formatPrice(v),
          },
          { key: "volume", label: "Volume" },
          { key: "part", label: "Part" },
        ]}
        data={diversTableData}
        variant="thedivers"
      />

      <DataTableModal
        open={openModals.nbRefs || false}
        onOpenChange={() => closeModal("nbRefs")}
        title="Références par catégorie"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "categorie", label: "Catégorie" },
          { key: "refs", label: "Nb Références" },
        ]}
        data={[
          {
            categorie: "Thé",
            refs: Object.keys(products?.["Thés"] || {}).length,
          },
          {
            categorie: "Divers",
            refs: Object.keys(
              products?.["Divers (Sucre, Chocolat, Gobelets...)"] || {},
            ).length,
          },
        ]}
        variant="thedivers"
      />

      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal("evolution")}
        title="Évolution Mensuelle Thé & Divers"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "mois", label: "Mois" },
          {
            key: "ca",
            label: "CA",
            format: (v) => formatPrice(v),
          },
          {
            key: "volume",
            label: "Volume (kg)",
            format: (v) => formatWeight(v),
          },
        ]}
        data={modalEvolutionData}
        variant="thedivers"
      />
    </div>
  );
}
