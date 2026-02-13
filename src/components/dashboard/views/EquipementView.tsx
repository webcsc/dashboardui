import { useModalState } from "@/hooks/useModalState";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { useMemo } from "react";
import { Settings, ShoppingCart, Shield, Droplets } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  DefaultTooltipContent,
  Cell,
} from "recharts";
import type { FilterState } from "@/types";
import {
  useOverview,
  useEvolution,
  useProducts,
} from "@/hooks/useDashboardData";
import { useViewFilters, useComparisonHelpers } from "@/hooks";
import { DataTableModal } from "../modals/DataTableModal";
import { transformEquipementEvolution } from "@/lib/dashboard-utils";
import { useState, useEffect } from "react";
import { formatPrice } from "@/lib";
import { EquipementMonthData } from "@/services/dashboard-api";
import { UniverseViewSkeleton } from "../skeletons";
import { EquipementProductMap } from "@/types/products";
import { renderEquipementProductView } from "@/lib/equipement-product-view-helpers";

interface EquipementViewProps {
  filters: FilterState;
  isComparing: boolean;
}

// Accessoires vente

export function EquipementView({ filters, isComparing }: EquipementViewProps) {
  const { openModals, openModal, closeModal, isAnyOpen } = useModalState([
    "caTotal",
    "location",
    "vente",
    "assistance",
    "entretien",
    "evolution",
  ]);
  const [modalClientId, setModalClientId] = useState<string | undefined>();

  // Sync modal filter with global filter when modal opens
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
  const { getTrend, getPreviousCurrencyValue } =
    useComparisonHelpers(isComparing);

  // Fetch API Data
  const {
    data: overviewResponse,
    isLoading: isLoadingOverview,
    isFetching: isFetchingOverview,
  } = useOverview("equipement", filters);
  const {
    data: evolutionResponse,
    isLoading: isLoadingEvolution,
    isFetching: isFetchingEvolution,
  } = useEvolution<EquipementMonthData>("equipement", filters);
  const { data: productsResponse } = useProducts<EquipementProductMap>(
    "equipement",
    filters,
  );

  // Fetch API Data (Modals)
  const { data: modalOverviewResponse } = useOverview(
    "equipement",
    modalFilters,
    { enabled: isAnyOpen },
  );
  const { data: modalEvolutionResponse, isFetching: isFetchingModalEvolution } =
    useEvolution<EquipementMonthData>("equipement", modalFilters, {
      enabled: isAnyOpen,
    });

  const modalOverview = modalOverviewResponse?.data;
  const modalEvolution = modalEvolutionResponse?.data;

  const { data: compareOverviewResponse } = useOverview(
    "equipement",
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );

  const { data: compareProductsResponse } = useProducts<EquipementProductMap>(
    "equipement",
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );

  const overview = overviewResponse?.data;
  const compareOverview = compareOverviewResponse?.data;
  const evolution = evolutionResponse?.data;
  const products = productsResponse?.products;
  const compareProducts = compareProductsResponse?.products;

  // Transform Evolution Data for Chart
  const currentYear = filters.period.start.getFullYear().toString();
  const isCurrentYear =
    filters.period.start.getFullYear() === new Date().getFullYear() &&
    filters.period.start.getMonth() === 0 &&
    filters.period.end.getMonth() === 11;

  const evolutionData = useMemo(
    () =>
      transformEquipementEvolution(
        evolution,
        currentYear,
        12,
        isCurrentYear,
        filters.period,
      ),
    [evolution, currentYear, isCurrentYear, filters.period],
  );
  const modalEvolutionData = useMemo(
    () =>
      transformEquipementEvolution(
        modalEvolution,
        currentYear,
        12,
        isCurrentYear,
        filters.period,
      ),
    [modalEvolution, currentYear, isCurrentYear, filters.period],
  );

  const renderBarCells = (color: string) => {
    return evolutionData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={color}
        fillOpacity={entry.actif === 0 ? 0.3 : 1}
      />
    ));
  };

  const modalCaTotal = modalOverview?.ca_total_ht_global || 0;

  // Show skeleton while loading or fetching (includes filter changes)
  const isLoading = isLoadingOverview || isLoadingEvolution;
  const isFetching = isFetchingOverview || isFetchingEvolution;
  if (isLoading || isFetching || !overview || !evolution) {
    return <UniverseViewSkeleton />;
  }

  function renderProductView() {
    return renderEquipementProductView({
      isComparing,
      products,
      compareProducts,
      getTrend,
      clientId: modalClientId,
      onClientChange: setModalClientId,
      filters,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs globaux */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Settings className="h-6 w-6 text-universe-equipement" />
          Univers Équipement – Vue d'ensemble
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BaseKpiCard
            label="CA Total Équipement"
            value={formatPrice(overview?.ca_total_ht_global || 0)}
            previousValue={getPreviousCurrencyValue(
              compareOverview?.ca_total_ht_global,
            )}
            trend={getTrend(
              overview?.ca_total_ht_global,
              Number(compareOverview?.ca_total_ht_global),
            )}
            icon={<Settings className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            onClick={() => openModal("caTotal")}
          />
          <BaseKpiCard
            label="Location Machines"
            value={formatPrice(overview?.ca_location_total_ht || 0)}
            previousValue={getPreviousCurrencyValue(
              compareOverview?.ca_location_total_ht,
            )}
            trend={getTrend(
              overview?.ca_location_total_ht,
              Number(compareOverview?.ca_location_total_ht),
            )}
            icon={<Settings className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            // onClick={() => openModal('location')}
          />
          <BaseKpiCard
            label="Vente Machines"
            value={formatPrice(overview?.ca_vente_total_ht || 0)}
            previousValue={getPreviousCurrencyValue(
              compareOverview?.ca_vente_total_ht,
            )}
            trend={getTrend(
              overview?.ca_vente_total_ht,
              Number(compareOverview?.ca_vente_total_ht),
            )}
            icon={<ShoppingCart className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            // onClick={() => openModal('vente')}
          />
          <BaseKpiCard
            label="Assistance Premium"
            value={formatPrice(overview?.ca_assistance_total_ht || 0)}
            previousValue={getPreviousCurrencyValue(
              compareOverview?.ca_assistance_total_ht,
            )}
            trend={getTrend(
              overview?.ca_assistance_total_ht,
              Number(compareOverview?.ca_assistance_total_ht),
            )}
            icon={<Shield className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            // onClick={() => openModal('assistance')}
          />
          <BaseKpiCard
            label="Produits Entretien"
            value={formatPrice(overview?.ca_entretien_total_ht || 0)}
            previousValue={getPreviousCurrencyValue(
              compareOverview?.ca_entretien_total_ht,
            )}
            trend={getTrend(
              overview?.ca_entretien_total_ht,
              Number(compareOverview?.ca_entretien_total_ht),
            )}
            icon={<Droplets className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            // onClick={() => openModal('entretien')}
          />
        </div>
      </div>

      {/* Graphiques Évolution */}
      <div className="grid grid-cols-1 gap-6">
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openModal("evolution")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Évolution Mensuelle par Catégorie
            </h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="mois" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                tickFormatter={(value) =>
                  `${((value || 0) / 1000).toFixed(0)}k`
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
                  return <DefaultTooltipContent payload={payload} {...props} />;
                }}
                formatter={(value: number, name: string) => [
                  formatPrice(value || 0),
                  name === "total" ? "CA Total" : name,
                ]}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Bar
                dataKey="location"
                name="Location"
                fill="hsl(200, 55%, 40%)"
                radius={[4, 4, 0, 0]}
              >
                {renderBarCells("hsl(200, 55%, 40%)")}
              </Bar>
              <Bar
                dataKey="vente"
                name="Vente"
                fill="hsl(200, 45%, 55%)"
                radius={[4, 4, 0, 0]}
              >
                {renderBarCells("hsl(200, 45%, 55%)")}
              </Bar>
              <Bar
                dataKey="assistance"
                name="Assistance"
                fill="hsl(200, 35%, 65%)"
                radius={[4, 4, 0, 0]}
              >
                {renderBarCells("hsl(200, 35%, 65%)")}
              </Bar>
              <Bar
                dataKey="entretien"
                name="Entretien"
                fill="hsl(200, 25%, 75%)"
                radius={[4, 4, 0, 0]}
              >
                {renderBarCells("hsl(200, 25%, 75%)")}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {renderProductView()}

      {/* Modals */}
      <DataTableModal
        open={openModals.caTotal || false}
        onOpenChange={() => closeModal("caTotal")}
        title="Répartition CA Équipement"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "categorie", label: "Catégorie" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v) },
          { key: "part", label: "Part" },
        ]}
        data={[
          {
            categorie: "Location machines",
            ca: modalOverview?.ca_location_total_ht || 0,
            part: modalCaTotal
              ? `${(((modalOverview?.ca_location_total_ht || 0) / modalCaTotal) * 100).toFixed(1)}%`
              : "0%",
          },
          {
            categorie: "Vente machines",
            ca: modalOverview?.ca_vente_total_ht || 0,
            part: modalCaTotal
              ? `${(((modalOverview?.ca_vente_total_ht || 0) / modalCaTotal) * 100).toFixed(1)}%`
              : "0%",
          },
          {
            categorie: "Assistance premium",
            ca: modalOverview?.ca_assistance_total_ht || 0,
            part: modalCaTotal
              ? `${(((modalOverview?.ca_assistance_total_ht || 0) / modalCaTotal) * 100).toFixed(1)}%`
              : "0%",
          },
          {
            categorie: "Produits entretien",
            ca: modalOverview?.ca_entretien_total_ht || 0,
            part: modalCaTotal
              ? `${(((modalOverview?.ca_entretien_total_ht || 0) / modalCaTotal) * 100).toFixed(1)}%`
              : "0%",
          },
        ].sort((a, b) => b.ca - a.ca)}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal("evolution")}
        title="Évolution Mensuelle Équipement"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "mois", label: "Mois" },
          {
            key: "location",
            label: "Location",
            format: (v) => formatPrice(v || 0),
          },
          { key: "vente", label: "Vente", format: (v) => formatPrice(v || 0) },
          {
            key: "assistance",
            label: "Assistance",
            format: (v) => formatPrice(v || 0),
          },
          {
            key: "entretien",
            label: "Entretien",
            format: (v) => formatPrice(v || 0),
          },
        ]}
        data={modalEvolutionData}
        variant="equipement"
        isLoading={isFetchingModalEvolution}
      />
    </div>
  );
}
