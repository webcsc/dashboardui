import { useModalState } from "@/hooks/useModalState";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { useMemo } from 'react';
import { Settings, ShoppingCart, Shield, Droplets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { FilterState } from "@/types";
import { useOverview, useEvolution, useDistribution } from "@/hooks/useDashboardData";
import { calculateTrend } from "@/lib/trend-utils";
import { DataTableModal } from "../modals/DataTableModal";
import { ProductCategorySection } from "../sections/ProductCategorySection";
import { EvolutionMonthData } from "@/services/dashboard-api";
import { transformEquipementDistribution, transformEquipementEvolution } from "@/lib/dashboard-utils";
import { useState, useEffect } from "react";

interface EquipementViewProps {
  filters: FilterState;
  isComparing: boolean;
}

const COLORS = [
  "hsl(200, 55%, 40%)",
  "hsl(200, 45%, 55%)",
  "hsl(200, 35%, 65%)",
  "hsl(200, 25%, 75%)",
];

// Location machines par marque
const locationMarqueData = [
  { marque: "Jura", ca: 45000, unites: 85, part: "36%" },
  { marque: "De'Longhi", ca: 32000, unites: 68, part: "26%" },
  { marque: "Saeco", ca: 28000, unites: 52, part: "22%" },
  { marque: "WMF", ca: 12000, unites: 18, part: "10%" },
  { marque: "Autres", ca: 8000, unites: 22, part: "6%" },
];

// Location par référence (top 10)
const locationRefData = [
  { reference: "Jura E8", marque: "Jura", ca: 18500, unites: 35 },
  { reference: "Jura Z10", marque: "Jura", ca: 15200, unites: 28 },
  { reference: "DeLonghi Magnifica", marque: "De'Longhi", ca: 12800, unites: 32 },
  { reference: "Saeco Xelsis", marque: "Saeco", ca: 11500, unites: 22 },
  { reference: "DeLonghi Dinamica", marque: "De'Longhi", ca: 9800, unites: 24 },
  { reference: "WMF 1100S", marque: "WMF", ca: 8500, unites: 12 },
];

// Accessoires location
const accessoiresLocationData = [
  { typologie: "Raccordement arrivée d'eau", ca: 8500, unites: 145, part: "32%" },
  { typologie: "Évacuation", ca: 5200, unites: 98, part: "20%" },
  { typologie: "Système paiement", ca: 6800, unites: 42, part: "26%" },
  { typologie: "Option lait", ca: 4200, unites: 78, part: "16%" },
  { typologie: "Autres", ca: 1800, unites: 35, part: "7%" },
];

// Assistance premium
const assistanceMarqueData = [
  { marque: "Jura", ca: 18500, contrats: 125, part: "44%" },
  { marque: "De'Longhi", ca: 12000, contrats: 95, part: "29%" },
  { marque: "Saeco", ca: 8500, contrats: 68, part: "20%" },
  { marque: "Autres", ca: 3000, contrats: 28, part: "7%" },
];

const assistanceRefData = [
  { reference: "Jura E8", marque: "Jura", ca: 8200, contrats: 55 },
  { reference: "Jura Z10", marque: "Jura", ca: 5800, contrats: 38 },
  { reference: "DeLonghi Magnifica", marque: "De'Longhi", ca: 4500, contrats: 35 },
  { reference: "Saeco Xelsis", marque: "Saeco", ca: 3800, contrats: 28 },
];

// Produits entretien
const entretienTypologieData = [
  { typologie: "Nettoyage", ca: 8500, unites: 420, part: "37%" },
  { typologie: "Filtration", ca: 6200, unites: 285, part: "27%" },
  { typologie: "Nettoyage lait", ca: 4800, unites: 195, part: "21%" },
  { typologie: "Détartrage", ca: 3500, unites: 180, part: "15%" },
];

const entretienMarqueData = [
  { marque: "Jura Care", ca: 9500, unites: 380, part: "41%" },
  { marque: "De'Longhi Care", ca: 6800, unites: 295, part: "30%" },
  { marque: "Générique Pro", ca: 4200, unites: 285, part: "18%" },
  { marque: "Autres", ca: 2500, unites: 120, part: "11%" },
];

// Vente machines
const venteMarqueData = [
  { marque: "Jura", ca: 38000, unites: 45, part: "40%" },
  { marque: "De'Longhi", ca: 28000, unites: 52, part: "29%" },
  { marque: "Saeco", ca: 18000, unites: 32, part: "19%" },
  { marque: "Autres", ca: 11000, unites: 28, part: "12%" },
];

const venteRefData = [
  { reference: "Jura E8", marque: "Jura", ca: 15200, unites: 18, prixMoyen: 845 },
  { reference: "DeLonghi Magnifica S", marque: "De'Longhi", ca: 12500, unites: 25, prixMoyen: 500 },
  { reference: "Jura Z10", marque: "Jura", ca: 11800, unites: 12, prixMoyen: 983 },
  { reference: "Saeco GranAroma", marque: "Saeco", ca: 8500, unites: 15, prixMoyen: 567 },
];

// Accessoires vente
const accessoiresVenteData = [
  { typologie: "Raccordement arrivée d'eau", ca: 4200, unites: 72, part: "28%" },
  { typologie: "Évacuation", ca: 2800, unites: 48, part: "19%" },
  { typologie: "Système paiement", ca: 3500, unites: 22, part: "23%" },
  { typologie: "Option lait", ca: 2800, unites: 45, part: "19%" },
  { typologie: "Autres", ca: 1700, unites: 38, part: "11%" },
];

export function EquipementView({ filters, isComparing }: EquipementViewProps) {
  const { openModals, openModal, closeModal, isAnyOpen } = useModalState(['caTotal', 'location', 'vente', 'assistance', 'entretien', 'evolution']);
  const [modalClientId, setModalClientId] = useState<string | undefined>();

  // Sync modal filter with global filter when modal opens
  useEffect(() => {
    if (isAnyOpen) {
      setModalClientId(filters.clientId);
    }
  }, [isAnyOpen, filters.clientId]);

  // Modal specific filters
  const modalFilters = useMemo(() => ({
    ...filters,
    clientId: modalClientId
  }), [filters, modalClientId]);

  // Fetch API Data (Main View)
  const { data: overviewResponse } = useOverview('equipement', filters);
  const { data: evolutionResponse } = useEvolution('equipement', filters);
  const { data: distributionResponse } = useDistribution('equipement', filters);

  // Fetch API Data (Modals)
  const { data: modalOverviewResponse } = useOverview('equipement', modalFilters, { enabled: isAnyOpen });
  const { data: modalEvolutionResponse } = useEvolution('equipement', modalFilters, { enabled: isAnyOpen });
  const { data: modalDistributionResponse } = useDistribution('equipement', modalFilters, { enabled: isAnyOpen });

  const modalOverview = modalOverviewResponse?.data;
  const modalEvolution = modalEvolutionResponse?.data;
  const modalDistribution = modalDistributionResponse?.distribution;

  // Comparison Data
  const comparisonFilters = useMemo(() => ({
    ...filters,
    period: filters.comparePeriod || filters.period
  }), [filters]);

  const { data: compareOverviewResponse } = useOverview('equipement', comparisonFilters, {
    enabled: isComparing && !!filters.comparePeriod
  });

  const overview = overviewResponse?.data;
  const compareOverview = compareOverviewResponse?.data;
  const evolution = evolutionResponse?.data;
  const distribution = distributionResponse?.distribution;

  // Transform Distribution Data
  const repartitionData = useMemo(() => transformEquipementDistribution(distribution), [distribution]);
  const modalRepartitionData = useMemo(() => transformEquipementDistribution(modalDistribution), [modalDistribution]);

  // Helper to calculate trend
  const getTrend = (current?: number, previous?: number) => {
    if (!isComparing || previous === undefined || previous === 0) return undefined;
    return calculateTrend(current || 0, previous || 0).value;
  };

  const getPreviousValue = (previous?: number) => {
    if (!isComparing || previous === undefined) return "-";
    return `${((previous || 0) / 1000).toFixed(1)}k€`;
  };

  // Transform Evolution Data for Chart
  const currentYear = filters.period.start.getFullYear().toString();
  const evolutionData = useMemo(() => transformEquipementEvolution(evolution, currentYear, 12), [evolution, currentYear]);
  const modalEvolutionData = useMemo(() => transformEquipementEvolution(modalEvolution, currentYear, 12), [modalEvolution, currentYear]);


  // If we have API data, we might want to prioritize it, but for the stacked bar chart which requires breakdown, 
  // we might need to stick to mock data OR just show the total if the breakdown is missing.
  // For this step, I will map the GLOBAL CA KPI.

  const caTotal = overview?.ca_total_ht_global || 0;
  const modalCaTotal = modalOverview?.ca_total_ht_global || 0;

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
            value={`${((overview?.ca_total_ht_global || 0) / 1000).toFixed(1)}k€`}
            previousValue={getPreviousValue(compareOverview?.ca_total_ht_global)}
            trend={getTrend(overview?.ca_total_ht_global, compareOverview?.ca_total_ht_global)}
            icon={<Settings className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            onClick={() => openModal('caTotal')}
          />
          <BaseKpiCard
            label="Location Machines"
            value={`${((overview?.ca_location_total_ht || 0) / 1000).toFixed(1)}k€`}
            previousValue={getPreviousValue(compareOverview?.ca_location_total_ht)}
            trend={getTrend(overview?.ca_location_total_ht, compareOverview?.ca_location_total_ht)}
            icon={<Settings className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            onClick={() => openModal('location')}
          />
          <BaseKpiCard
            label="Vente Machines"
            value={`${((overview?.ca_vente_total_ht || 0) / 1000).toFixed(1)}k€`}
            previousValue={getPreviousValue(compareOverview?.ca_vente_total_ht)}
            trend={getTrend(overview?.ca_vente_total_ht, compareOverview?.ca_vente_total_ht)}
            icon={<ShoppingCart className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            onClick={() => openModal('vente')}
          />
          <BaseKpiCard
            label="Assistance Premium"
            value={`${((overview?.ca_assistance_total_ht || 0) / 1000).toFixed(1)}k€`}
            previousValue={getPreviousValue(compareOverview?.ca_assistance_total_ht)}
            trend={getTrend(overview?.ca_assistance_total_ht, compareOverview?.ca_assistance_total_ht)}
            icon={<Shield className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            onClick={() => openModal('assistance')}
          />
          <BaseKpiCard
            label="Produits Entretien"
            value={`${((overview?.ca_entretien_total_ht || 0) / 1000).toFixed(1)}k€`}
            previousValue={getPreviousValue(compareOverview?.ca_entretien_total_ht)}
            trend={getTrend(overview?.ca_entretien_total_ht, compareOverview?.ca_entretien_total_ht)}
            icon={<Droplets className="h-5 w-5 text-universe-equipement" />}
            showComparison={isComparing}
            onClick={() => openModal('entretien')}
          />
        </div>
      </div>

      {/* Graphiques Évolution */}
      <div className="grid grid-cols-1 gap-6">
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openModal('evolution')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Évolution Mensuelle par Catégorie</h3>
            <span className="text-xs text-muted-foreground underline">Voir tableau</span>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={evolutionData}>
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
                formatter={(value: number, name: string) => [
                  `${((value || 0) / 1000).toFixed(0)}k€`,
                  name === 'total' ? 'CA Total' : name
                ]}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Bar dataKey="location" name="Location" fill="hsl(200, 55%, 40%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vente" name="Vente" fill="hsl(200, 45%, 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="assistance" name="Assistance" fill="hsl(200, 35%, 65%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="entretien" name="Entretien" fill="hsl(200, 25%, 75%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Machines */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5 text-universe-equipement" />
          Location Machines
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProductCategorySection
            title="Par Marque"
            columns={[
              { key: "marque", label: "Marque", width: "w-[40%]" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
              { key: "unites", label: "Unités", width: "w-[20%]" },
              { key: "part", label: "Part", width: "w-[20%]" },
            ]}
            data={locationMarqueData}
            variant="equipement"
            compact
          />
          <ProductCategorySection
            title="Par Référence (Top)"
            columns={[
              { key: "reference", label: "Référence", width: "w-[40%]" },
              { key: "marque", label: "Marque", width: "w-[20%]" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
              { key: "unites", label: "Unités", width: "w-[20%]" },
            ]}
            data={locationRefData}
            variant="equipement"
            compact
          />
        </div>
        <ProductCategorySection
          title="Accessoires Location"
          columns={[
            { key: "typologie", label: "Typologie", width: "w-[40%]" },
            { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
            { key: "unites", label: "Unités", width: "w-[20%]" },
            { key: "part", label: "Part", width: "w-[20%]" },
          ]}
          data={accessoiresLocationData}
          variant="equipement"
        />
      </div>

      {/* Assistance Premium */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-universe-equipement" />
          Assistance Premium
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProductCategorySection
            title="Par Marque"
            columns={[
              { key: "marque", label: "Marque", width: "w-[40%]" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
              { key: "contrats", label: "Contrats", width: "w-[20%]" },
              { key: "part", label: "Part", width: "w-[20%]" },
            ]}
            data={assistanceMarqueData}
            variant="equipement"
            compact
          />
          <ProductCategorySection
            title="Par Référence Machine"
            columns={[
              { key: "reference", label: "Référence", width: "w-[40%]" },
              { key: "marque", label: "Marque", width: "w-[20%]" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
              { key: "contrats", label: "Contrats", width: "w-[20%]" },
            ]}
            data={assistanceRefData}
            variant="equipement"
            compact
          />
        </div>
      </div>

      {/* Produits Entretien */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Droplets className="h-5 w-5 text-universe-equipement" />
          Produits Entretien
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProductCategorySection
            title="Par Typologie"
            columns={[
              { key: "typologie", label: "Type", width: "w-[40%]" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
              { key: "unites", label: "Unités", width: "w-[20%]" },
              { key: "part", label: "Part", width: "w-[20%]" },
            ]}
            data={entretienTypologieData}
            variant="equipement"
            compact
          />
          <ProductCategorySection
            title="Par Marque"
            columns={[
              { key: "marque", label: "Marque", width: "w-[40%]" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
              { key: "unites", label: "Unités", width: "w-[20%]" },
              { key: "part", label: "Part", width: "w-[20%]" },
            ]}
            data={entretienMarqueData}
            variant="equipement"
            compact
          />
        </div>
      </div>

      {/* Vente Machines */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-universe-equipement" />
          Vente Machines et Accessoires
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProductCategorySection
            title="Machines par Marque"
            columns={[
              { key: "marque", label: "Marque", width: "w-[40%]" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
              { key: "unites", label: "Unités", width: "w-[20%]" },
              { key: "part", label: "Part", width: "w-[20%]" },
            ]}
            data={venteMarqueData}
            variant="equipement"
            compact
          />
          <ProductCategorySection
            title="Top Références"
            columns={[
              { key: "reference", label: "Référence", width: "w-[40%]" },
              { key: "marque", label: "Marque", width: "w-[20%]" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
              { key: "prixMoyen", label: "Prix moy.", format: (v) => `${v}€`, width: "w-[20%]" },
            ]}
            data={venteRefData}
            variant="equipement"
            compact
          />
        </div>
        <ProductCategorySection
          title="Accessoires Vente"
          columns={[
            { key: "typologie", label: "Typologie", width: "w-[40%]" },
            { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`, width: "w-[20%]" },
            { key: "unites", label: "Unités", width: "w-[20%]" },
            { key: "part", label: "Part", width: "w-[20%]" },
          ]}
          data={accessoiresVenteData}
          variant="equipement"
        />
      </div>

      {/* Modals */}
      <DataTableModal
        open={openModals.caTotal || false}
        onOpenChange={() => closeModal('caTotal')}
        title="Répartition CA Équipement"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "categorie", label: "Catégorie" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(1)}k€` },
          { key: "part", label: "Part" },
        ]}
        data={[
          {
            categorie: "Location machines",
            ca: modalOverview?.ca_location_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_location_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            categorie: "Vente machines",
            ca: modalOverview?.ca_vente_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_vente_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            categorie: "Assistance premium",
            ca: modalOverview?.ca_assistance_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_assistance_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            categorie: "Produits entretien",
            ca: modalOverview?.ca_entretien_total_ht || 0,
            part: modalCaTotal ? `${((modalOverview?.ca_entretien_total_ht || 0) / modalCaTotal * 100).toFixed(1)}%` : "0%"
          },
        ].sort((a, b) => b.ca - a.ca)}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.location || false}
        onOpenChange={() => closeModal('location')}
        title="Top marques location"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "marque", label: "Marque" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          { key: "unites", label: "Unités" },
        ]}
        data={locationMarqueData}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.vente || false}
        onOpenChange={() => closeModal('vente')}
        title="Top marques vente"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "marque", label: "Marque" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          { key: "unites", label: "Unités" },
        ]}
        data={venteMarqueData}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.assistance || false}
        onOpenChange={() => closeModal('assistance')}
        title="Contrats assistance"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "marque", label: "Marque" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          { key: "contrats", label: "Contrats" },
        ]}
        data={assistanceMarqueData}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.entretien || false}
        onOpenChange={() => closeModal('entretien')}
        title="Répartition entretien"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "typologie", label: "Type" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          { key: "part", label: "Part" },
        ]}
        data={entretienTypologieData}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal('evolution')}
        title="Évolution Mensuelle Équipement"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: "mois", label: "Mois" },
          { key: "location", label: "Location", format: (v) => `${(v || 0).toLocaleString()}€` },
          { key: "vente", label: "Vente", format: (v) => `${(v || 0).toLocaleString()}€` },
          { key: "assistance", label: "Assistance", format: (v) => `${(v || 0).toLocaleString()}€` },
          { key: "entretien", label: "Entretien", format: (v) => `${(v || 0).toLocaleString()}€` },
        ]}
        data={modalEvolutionData}
        variant="equipement"
      />
    </div >
  );
}



