import { useModalState } from "@/hooks/useModalState";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { useMemo } from 'react';
import { Wrench, Package, RefreshCw, ArrowRightLeft, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, DefaultTooltipContent } from "recharts";
import type { FilterState } from "@/types";
import { useOverview, useEvolution, useDistribution } from "@/hooks/useDashboardData";
import { useViewFilters, useComparisonHelpers } from '@/hooks';
import { DataTableModal } from "../modals/DataTableModal";
import { ProductCategorySection } from "../sections/ProductCategorySection";
import { transformServiceDistribution, transformServiceEvolution } from "@/lib/dashboard-utils";
import { useState, useEffect } from "react";
import { formatPrice } from "@/lib";
import { ServiceMonthData } from "@/services/dashboard-api";

interface ServiceViewProps {
  filters: FilterState;
  isComparing: boolean;
}

// KPIs globaux service
const serviceOverview = {
  caTotal: 142000,
  installation: 35000,
  reparation: 52000,
  cartouche: 28000,
  pret: 15000,
  echange: 12000,
};

// Évolution mensuelle
const evolutionMensuelleData = [
  { mois: "Jan", installation: 5200, reparation: 8200, cartouche: 4500, pret: 2400, echange: 1800 },
  { mois: "Fév", installation: 5800, reparation: 8800, cartouche: 4800, pret: 2600, echange: 2000 },
  { mois: "Mar", installation: 6200, reparation: 9200, cartouche: 4600, pret: 2500, echange: 2100 },
  { mois: "Avr", installation: 5500, reparation: 8500, cartouche: 4700, pret: 2400, echange: 1900 },
  { mois: "Mai", installation: 6100, reparation: 8800, cartouche: 4700, pret: 2500, echange: 2100 },
  { mois: "Juin", installation: 6200, reparation: 8500, cartouche: 4700, pret: 2600, echange: 2100 },
];



const COLORS = [
  "hsl(280, 45%, 45%)",
  "hsl(280, 40%, 55%)",
  "hsl(280, 35%, 65%)",
  "hsl(280, 30%, 72%)",
  "hsl(280, 25%, 80%)",
];

// Installation
const installationData = [
  { type: "Installation standard", ca: 18500, interventions: 125, prixMoyen: 148 },
  { type: "Installation complexe", ca: 12200, interventions: 42, prixMoyen: 290 },
  { type: "Raccordement eau", ca: 4300, interventions: 58, prixMoyen: 74 },
];

// Réparation
const reparationSousAssistanceData = [
  { marque: "Jura", ca: 12500, interventions: 85, part: "38%" },
  { marque: "De'Longhi", ca: 9200, interventions: 72, part: "28%" },
  { marque: "Saeco", ca: 6800, interventions: 48, part: "21%" },
  { marque: "Autres", ca: 4500, interventions: 35, part: "14%" },
];

const reparationHorsAssistanceData = [
  { marque: "Jura", ca: 8500, interventions: 45, prixMoyen: 189 },
  { marque: "De'Longhi", ca: 5800, interventions: 38, prixMoyen: 153 },
  { marque: "Saeco", ca: 3200, interventions: 22, prixMoyen: 145 },
  { marque: "Autres", ca: 1500, interventions: 12, prixMoyen: 125 },
];

// Changement cartouche
const cartoucheData = [
  { marque: "Jura", ca: 12500, interventions: 185, part: "45%" },
  { marque: "De'Longhi", ca: 8200, interventions: 125, part: "29%" },
  { marque: "Saeco", ca: 4800, interventions: 72, part: "17%" },
  { marque: "Autres", ca: 2500, interventions: 38, part: "9%" },
];

// Prêt machine
const pretMachineData = [
  { type: "Prêt court (<7j)", ca: 8500, prets: 125, duréeMoy: "4 jours" },
  { type: "Prêt moyen (7-30j)", ca: 4800, prets: 42, duréeMoy: "18 jours" },
  { type: "Prêt long (>30j)", ca: 1700, prets: 8, duréeMoy: "52 jours" },
];

// Échange standard
const echangeStandardData = [
  { marque: "Jura", ca: 5800, echanges: 28, part: "48%" },
  { marque: "De'Longhi", ca: 3500, echanges: 22, part: "29%" },
  { marque: "Saeco", ca: 1800, echanges: 12, part: "15%" },
  { marque: "Autres", ca: 900, echanges: 6, part: "8%" },
];

export function ServiceView({ filters, isComparing }: ServiceViewProps) {
  const { openModals, openModal, closeModal, isAnyOpen } = useModalState(['caTotal', 'installation', 'reparation', 'cartouche', 'pretEchange', 'evolution', 'repartition']);
  const [modalClientId, setModalClientId] = useState<string | undefined>();

  // Sync modal filter
  useEffect(() => {
    if (isAnyOpen) {
      setModalClientId(filters.clientId);
    }
  }, [isAnyOpen, filters.clientId]);

  // Use custom hooks for filters and comparison helpers
  const { modalFilters, comparisonFilters } = useViewFilters(filters, modalClientId);
  const { getTrend, getPreviousValue, getPreviousCurrencyValue } = useComparisonHelpers(isComparing);

  // Fetch API Data
  const { data: overviewResponse } = useOverview('service', filters);
  const { data: evolutionResponse } = useEvolution<ServiceMonthData>('service', filters);
  const { data: distributionResponse } = useDistribution('service', filters);

  // Fetch API Data (Modals)
  const { data: modalOverviewResponse } = useOverview('service', modalFilters, { enabled: isAnyOpen });
  const { data: modalEvolutionResponse } = useEvolution<ServiceMonthData>('service', modalFilters, { enabled: isAnyOpen });
  const { data: modalDistributionResponse } = useDistribution('service', modalFilters, { enabled: isAnyOpen });

  const modalOverview = modalOverviewResponse?.data;
  const modalEvolution = modalEvolutionResponse?.data;
  const modalDistribution = modalDistributionResponse?.distribution;

  const { data: compareOverviewResponse } = useOverview('service', comparisonFilters, {
    enabled: isComparing && !!filters.comparePeriod
  });

  const overview = overviewResponse?.data;
  const compareOverview = compareOverviewResponse?.data;
  const evolution = evolutionResponse?.data;
  const distribution = distributionResponse?.distribution;

  // Transform Distribution Data
  const repartitionData = useMemo(() => transformServiceDistribution(distribution), [distribution]);
  const modalRepartitionData = useMemo(() => transformServiceDistribution(modalDistribution), [modalDistribution]);


  // Transform Evolution Data for Chart
  const currentYear = filters.period.start.getFullYear().toString();
  const isCurrentYear =
    filters.period.start.getFullYear() === new Date().getFullYear() &&
    filters.period.start.getMonth() === 0 &&
    filters.period.end.getMonth() === 11;

  const evolutionData = useMemo(() => transformServiceEvolution(evolution, currentYear, 12, isCurrentYear, filters.period), [evolution, currentYear, isCurrentYear, filters.period]);
  const modalEvolutionData = useMemo(() => transformServiceEvolution(modalEvolution, currentYear, 12, isCurrentYear, filters.period), [modalEvolution, currentYear, isCurrentYear, filters.period]);
  const caTotal = overview?.ca_total_ht_global || 0;
  const modalCaTotal = modalOverview?.ca_total_ht_global || 0;

  const renderBarCells = (data: typeof evolutionData, color: string) => {
    return data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={color} fillOpacity={entry.actif === 0 ? 0.3 : 1} />
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs globaux */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Wrench className="h-6 w-6 text-universe-service" />
          Univers Service – Vue d'ensemble
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BaseKpiCard
            label="CA Total Service"
            value={formatPrice(caTotal || 0)}
            previousValue={getPreviousCurrencyValue(compareOverview?.ca_total_ht_global)}
            trend={getTrend(overview?.ca_total_ht_global, Number(compareOverview?.ca_total_ht_global))}
            icon={<Wrench className="h-5 w-5 text-universe-service" />}
            showComparison={isComparing}
            onClick={() => openModal('caTotal')}
          />
          <BaseKpiCard
            label="Installation"
            value={formatPrice((overview?.ca_installation_total_ht || 0))}
            previousValue={getPreviousCurrencyValue(compareOverview?.ca_installation_total_ht)}
            trend={getTrend(overview?.ca_installation_total_ht, Number(compareOverview?.ca_installation_total_ht))}
            icon={<Settings className="h-5 w-5 text-universe-service" />}
            showComparison={isComparing}
          // onClick={() => openModal('installation')}
          />
          <BaseKpiCard
            label="Réparation"
            value={formatPrice(overview?.ca_reparation_total_ht || 0)}
            previousValue={getPreviousCurrencyValue(compareOverview?.ca_reparation_total_ht)}
            trend={getTrend(overview?.ca_reparation_total_ht, Number(compareOverview?.ca_reparation_total_ht))}
            icon={<Wrench className="h-5 w-5 text-universe-service" />}
            showComparison={isComparing}
          // onClick={() => openModal('reparation')}
          />
          <BaseKpiCard
            label="Changement Cartouche"
            value={formatPrice(overview?.ca_cartouche_total_ht || 0)}
            previousValue={getPreviousCurrencyValue(compareOverview?.ca_cartouche_total_ht)}
            trend={getTrend(overview?.ca_cartouche_total_ht, Number(compareOverview?.ca_cartouche_total_ht))}
            icon={<RefreshCw className="h-5 w-5 text-universe-service" />}
            showComparison={isComparing}
          // onClick={() => openModal('cartouche')}
          />
          <BaseKpiCard
            label="Prêt / Échange"
            value={formatPrice((overview?.ca_pret_total_ht || 0) + (overview?.ca_echange_total_ht || 0))}
            previousValue={getPreviousCurrencyValue((compareOverview?.ca_pret_total_ht || 0) + (compareOverview?.ca_echange_total_ht || 0))}
            trend={getTrend((overview?.ca_pret_total_ht || 0) + (overview?.ca_echange_total_ht || 0), Number((compareOverview?.ca_pret_total_ht || 0) + (compareOverview?.ca_echange_total_ht || 0)))}
            icon={<ArrowRightLeft className="h-5 w-5 text-universe-service" />}
            showComparison={isComparing}
          // onClick={() => openModal('pretEchange')}
          />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openModal('repartition')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Répartition par Type de Service</h3>
            <span className="text-xs text-muted-foreground underline">Voir tableau</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={repartitionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {repartitionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          onClick={() => openModal('evolution')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Évolution Mensuelle</h3>
            <span className="text-xs text-muted-foreground underline">Voir tableau</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={evolutionData.length > 0 ? evolutionData : evolutionMensuelleData}>
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
                content={({ payload, ...props }) => {
                  if (!payload || payload.length === 0) return null;
                  return <DefaultTooltipContent payload={payload} {...props} />;
                }}
                formatter={(value: number, name: string) => [
                  formatPrice(value || 0),
                  name === 'total' ? 'CA Total' : name
                ]}
              />
              <Legend />
              {!(evolutionData.length > 0) ? (
                <Bar dataKey="total" name="CA Total" fill="hsl(280, 45%, 45%)" radius={[4, 4, 0, 0]} />
              ) : (
                <>
                  <Bar dataKey="reparation" name="Échange" fill="hsl(281, 46%, 24%)" radius={[4, 4, 0, 0]} stackId="a">
                    {renderBarCells(evolutionData, "hsl(281, 46%, 24%)")}
                  </Bar>
                  <Bar dataKey="reparation" name="Réparation" fill="hsl(280, 45%, 45%)" radius={[4, 4, 0, 0]} stackId="a">
                    {renderBarCells(evolutionData, "hsl(280, 45%, 45%)")}
                  </Bar>
                  <Bar dataKey="installation" name="Installation" fill="hsl(280, 40%, 55%)" radius={[4, 4, 0, 0]} stackId="a">
                    {renderBarCells(evolutionData, "hsl(280, 40%, 55%)")}
                  </Bar>
                  <Bar dataKey="cartouche" name="Cartouche" fill="hsl(280, 35%, 65%)" radius={[4, 4, 0, 0]} stackId="a">
                    {renderBarCells(evolutionData, "hsl(280, 35%, 65%)")}
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Installation */}
      <ProductCategorySection
        title="Installation"
        icon={<Settings className="h-5 w-5 text-universe-service" />}
        columns={[
          { key: "type", label: "Type" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0) },
          { key: "interventions", label: "Interventions" },
          { key: "prixMoyen", label: "Prix moy.", format: (v) => formatPrice(v || 0) },
        ]}
        data={installationData}
        variant="service"
      />

      {/* Réparation */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Wrench className="h-5 w-5 text-universe-service" />
          Réparation
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProductCategorySection
            title="Sous Assistance"
            columns={[
              { key: "marque", label: "Marque", width: "w-[40%]" },
              { key: "ca", label: "CA", format: (v) => formatPrice(v || 0), width: "w-[20%]" },
              { key: "interventions", label: "Interventions", width: "w-[20%]" },
              { key: "part", label: "Part", width: "w-[20%]" },
            ]}
            data={reparationSousAssistanceData}
            variant="service"
            compact
          />
          <ProductCategorySection
            title="Hors Assistance"
            columns={[
              { key: "marque", label: "Marque", width: "w-[40%]" },
              { key: "ca", label: "CA", format: (v) => formatPrice(v || 0), width: "w-[20%]" },
              { key: "interventions", label: "Interventions", width: "w-[20%]" },
              { key: "prixMoyen", label: "Prix moy.", format: (v) => formatPrice(v || 0), width: "w-[20%]" },
            ]}
            data={reparationHorsAssistanceData}
            variant="service"
            compact
          />
        </div>
      </div>

      {/* Changement cartouche */}
      <ProductCategorySection
        title="Changement Cartouche"
        icon={<RefreshCw className="h-5 w-5 text-universe-service" />}
        columns={[
          { key: "marque", label: "Marque", width: "w-[40%]" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0), width: "w-[20%]" },
          { key: "interventions", label: "Interventions", width: "w-[20%]" },
          { key: "part", label: "Part", width: "w-[20%]" },
        ]}
        data={cartoucheData}
        variant="service"
      />

      {/* Prêt de machine */}
      <ProductCategorySection
        title="Prêt de Machine"
        icon={<Package className="h-5 w-5 text-universe-service" />}
        columns={[
          { key: "type", label: "Type", width: "w-[40%]" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0), width: "w-[20%]" },
          { key: "prets", label: "Prêts", width: "w-[20%]" },
          { key: "duréeMoy", label: "Durée moy.", width: "w-[20%]" },
        ]}
        data={pretMachineData}
        variant="service"
      />

      {/* Échange standard */}
      <ProductCategorySection
        title="Échange Standard"
        icon={<ArrowRightLeft className="h-5 w-5 text-universe-service" />}
        columns={[
          { key: "marque", label: "Marque", width: "w-[40%]" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0), width: "w-[20%]" },
          { key: "echanges", label: "Échanges", width: "w-[20%]" },
          { key: "part", label: "Part", width: "w-[20%]" },
        ]}
        data={echangeStandardData}
        variant="service"
      />

      {/* Modals */}
      <DataTableModal
        open={openModals.caTotal || false}
        onOpenChange={() => closeModal('caTotal')}
        title="Répartition CA Service"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "service", label: "Service" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0) },
          { key: "part", label: "Part" },
        ]}
        data={[
          {
            service: "Réparation",
            ca: modalOverview?.ca_reparation_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_reparation_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            service: "Installation",
            ca: modalOverview?.ca_installation_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_installation_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            service: "Changement cartouche",
            ca: modalOverview?.ca_cartouche_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_cartouche_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            service: "Prêt machine",
            ca: modalOverview?.ca_pret_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_pret_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            service: "Échange standard",
            ca: modalOverview?.ca_echange_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_echange_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
        ].sort((a, b) => b.ca - a.ca)}
        variant="service"
      />
      <DataTableModal
        open={openModals.installation || false}
        onOpenChange={() => closeModal('installation')}
        title="Détail installations"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "type", label: "Type" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0) },
          { key: "interventions", label: "Interventions" },
        ]}
        data={installationData}
        variant="service"
      />
      <DataTableModal
        open={openModals.reparation || false}
        onOpenChange={() => closeModal('reparation')}
        title="Réparations par marque"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "marque", label: "Marque" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0) },
          { key: "interventions", label: "Interventions" },
        ]}
        data={reparationSousAssistanceData}
        variant="service"
      />
      <DataTableModal
        open={openModals.cartouche || false}
        onOpenChange={() => closeModal('cartouche')}
        title="Cartouches par marque"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "marque", label: "Marque" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0) },
          { key: "interventions", label: "Interventions" },
        ]}
        data={cartoucheData}
        variant="service"
      />
      <DataTableModal
        open={openModals.pretEchange || false}
        onOpenChange={() => closeModal('pretEchange')}
        title="Prêts et échanges"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "type", label: "Type" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0) },
          { key: "nombre", label: "Nombre" },
        ]}
        data={[
          { type: "Prêt machine", ca: modalOverview?.ca_pret_total_ht || 0, nombre: 175 },
          { type: "Échange standard", ca: modalOverview?.ca_echange_total_ht || 0, nombre: 68 },
        ]}
        variant="service"
      />
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal('evolution')}
        title="Évolution Mensuelle Service"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "mois", label: "Mois" },
          { key: "installation", label: "Installation", format: (v) => formatPrice(v || 0) },
          { key: "reparation", label: "Réparation", format: (v) => formatPrice(v || 0) },
          { key: "cartouche", label: "Cartouche", format: (v) => formatPrice(v || 0) },
          { key: "pret", label: "Prêt", format: (v) => formatPrice(v || 0) },
          { key: "echange", label: "Échange", format: (v) => formatPrice(v || 0) },
        ]}
        data={modalEvolutionData.length > 0 ? modalEvolutionData : (modalEvolutionResponse ? [] : evolutionMensuelleData)}
        variant="service"
      />
      <DataTableModal
        open={openModals.repartition || false}
        onOpenChange={() => closeModal('repartition')}
        title="Répartition par Type de Service"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "name", label: "Service" },
          { key: "ca", label: "CA", format: (v) => formatPrice(v || 0) },
          { key: "value", label: "Part", format: (v) => `${v}%` },
        ]}
        data={modalRepartitionData}
        variant="service"
      />
    </div>
  );
}



