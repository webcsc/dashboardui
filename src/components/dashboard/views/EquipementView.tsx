import { useModalState } from "@/hooks/useModalState";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { useMemo } from 'react';
import { Settings, ShoppingCart, Shield, Droplets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { FilterState } from "@/types";
import { useOverview, useEvolution, useDistribution } from "@/hooks/useDashboardData";
import { PieChart, Pie, Cell } from "recharts";
import { calculateTrend } from "@/lib/trend-utils";
import { DataTableModal } from "../modals/DataTableModal";
import { ProductCategorySection } from "../sections/ProductCategorySection";

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

// KPIs globaux
const equipementOverview = {
  caTotal: 285000,
  location: 125000,
  vente: 95000,
  assistance: 42000,
  entretien: 23000,
};

// Évolution mensuelle
const evolutionMensuelleData = [
  { mois: "Jan", location: 18500, vente: 14200, assistance: 6500, entretien: 3500 },
  { mois: "Fév", location: 19200, vente: 15800, assistance: 6800, entretien: 3800 },
  { mois: "Mar", location: 21000, vente: 16500, assistance: 7200, entretien: 4000 },
  { mois: "Avr", location: 20500, vente: 15200, assistance: 6900, entretien: 3700 },
  { mois: "Mai", location: 22800, vente: 17500, assistance: 7400, entretien: 4100 },
  { mois: "Juin", location: 23000, vente: 15800, assistance: 7200, entretien: 3900 },
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
  const { openModals, openModal, closeModal } = useModalState(['caTotal', 'location', 'vente', 'assistance', 'entretien', 'evolution']);

  // Fetch API Data
  const { data: overviewResponse } = useOverview('equipement', filters);
  const { data: evolutionResponse } = useEvolution('equipement', filters);
  const { data: distributionResponse } = useDistribution('equipement', filters);

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
  const repartitionData = useMemo(() => {
    if (!distribution) return [];
    return Object.entries(distribution).map(([key, item]: [string, any]) => ({
      name: item.poid_unit || key,
      ca: item.ca_total_ht,
      value: parseFloat(item.percentage) || 0,
    })).sort((a, b) => b.value - a.value);
  }, [distribution]);

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
  const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const evolutionData = evolution?.[currentYear] ? Object.entries(evolution[currentYear])
    .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
    .map(([month, data]: [string, any]) => {
      const monthData = Array.isArray(data) ? data[0] : data;
      return {
        mois: month.substring(0, 3), // "January" -> "Jan"
        location: 0, // Breakdown not available in API yet
        vente: 0,
        assistance: 0,
        entretien: 0,
        total: monthData?.ca_total_ht || 0
      };
    }) : [];

  // If we have API data, we might want to prioritize it, but for the stacked bar chart which requires breakdown, 
  // we might need to stick to mock data OR just show the total if the breakdown is missing.
  // For this step, I will map the GLOBAL CA KPI.

  const caTotal = overview?.ca_total_ht_global || 0;

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



      {/* Graphiques Répartition et Évolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openModal('caTotal')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Répartition par Catégorie</h3>
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
            <h3 className="text-lg font-semibold">Évolution Mensuelle par Catégorie</h3>
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
                formatter={(value: number, name: string) => [
                  `${(value || 0).toLocaleString()}€`,
                  name === 'total' ? 'CA Total' : name
                ]}
              />
              <Legend />
              {evolutionData.length > 0 ? (
                <Bar dataKey="total" name="CA Total" fill="hsl(200, 55%, 40%)" radius={[4, 4, 0, 0]} />
              ) : (
                <>
                  <Bar dataKey="location" name="Location" fill="hsl(200, 55%, 40%)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="vente" name="Vente" fill="hsl(200, 45%, 55%)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="assistance" name="Assistance" fill="hsl(200, 35%, 65%)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="entretien" name="Entretien" fill="hsl(200, 25%, 75%)" radius={[4, 4, 0, 0]} stackId="a" />
                </>
              )}
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
              { key: "marque", label: "Marque" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "unites", label: "Unités" },
              { key: "part", label: "Part" },
            ]}
            data={locationMarqueData.filter(item => item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
            variant="equipement"
            compact
          />
          <ProductCategorySection
            title="Par Référence (Top)"
            columns={[
              { key: "reference", label: "Référence" },
              { key: "marque", label: "Marque" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "unites", label: "Unités" },
            ]}
            data={locationRefData.filter(item => item.reference.toLowerCase().includes(filters.searchProduct?.toLowerCase() || '') || item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
            variant="equipement"
            compact
          />
        </div>
        <ProductCategorySection
          title="Accessoires Location"
          columns={[
            { key: "typologie", label: "Typologie" },
            { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            { key: "unites", label: "Unités" },
            { key: "part", label: "Part" },
          ]}
          data={accessoiresLocationData.filter(item => item.typologie.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
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
              { key: "marque", label: "Marque" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "contrats", label: "Contrats" },
              { key: "part", label: "Part" },
            ]}
            data={assistanceMarqueData.filter(item => item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
            variant="equipement"
            compact
          />
          <ProductCategorySection
            title="Par Référence Machine"
            columns={[
              { key: "reference", label: "Référence" },
              { key: "marque", label: "Marque" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "contrats", label: "Contrats" },
            ]}
            data={assistanceRefData.filter(item => item.reference.toLowerCase().includes(filters.searchProduct?.toLowerCase() || '') || item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
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
              { key: "typologie", label: "Type" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "unites", label: "Unités" },
              { key: "part", label: "Part" },
            ]}
            data={entretienTypologieData.filter(item => item.typologie.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
            variant="equipement"
            compact
          />
          <ProductCategorySection
            title="Par Marque"
            columns={[
              { key: "marque", label: "Marque" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "unites", label: "Unités" },
              { key: "part", label: "Part" },
            ]}
            data={entretienMarqueData.filter(item => item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
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
              { key: "marque", label: "Marque" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "unites", label: "Unités" },
              { key: "part", label: "Part" },
            ]}
            data={venteMarqueData.filter(item => item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
            variant="equipement"
            compact
          />
          <ProductCategorySection
            title="Top Références"
            columns={[
              { key: "reference", label: "Référence" },
              { key: "marque", label: "Marque" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "prixMoyen", label: "Prix moy.", format: (v) => `${v}€` },
            ]}
            data={venteRefData.filter(item => item.reference.toLowerCase().includes(filters.searchProduct?.toLowerCase() || '') || item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
            variant="equipement"
            compact
          />
        </div>
        <ProductCategorySection
          title="Accessoires Vente"
          columns={[
            { key: "typologie", label: "Typologie" },
            { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            { key: "unites", label: "Unités" },
            { key: "part", label: "Part" },
          ]}
          data={accessoiresVenteData.filter(item => item.typologie.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
          variant="equipement"
        />
      </div>

      {/* Modals */}
      <DataTableModal
        open={openModals.caTotal || false}
        onOpenChange={() => closeModal('caTotal')}
        title="Répartition CA Équipement"
        columns={[
          { key: "categorie", label: "Catégorie" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(1)}k€` },
          { key: "part", label: "Part" },
        ]}
        data={[
          {
            categorie: "Location machines",
            ca: overview?.ca_location_total_ht || 0,
            part: caTotal ? `${((overview?.ca_location_total_ht || 0) / caTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            categorie: "Vente machines",
            ca: overview?.ca_vente_total_ht || 0,
            part: caTotal ? `${((overview?.ca_vente_total_ht || 0) / caTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            categorie: "Assistance premium",
            ca: overview?.ca_assistance_total_ht || 0,
            part: caTotal ? `${((overview?.ca_assistance_total_ht || 0) / caTotal * 100).toFixed(1)}%` : "0%"
          },
          {
            categorie: "Produits entretien",
            ca: overview?.ca_entretien_total_ht || 0,
            part: caTotal ? `${((overview?.ca_entretien_total_ht || 0) / caTotal * 100).toFixed(1)}%` : "0%"
          },
        ].sort((a, b) => b.ca - a.ca)}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.location || false}
        onOpenChange={() => closeModal('location')}
        title="Top marques location"
        columns={[
          { key: "marque", label: "Marque" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          { key: "unites", label: "Unités" },
        ]}
        data={locationMarqueData.filter(item => item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.vente || false}
        onOpenChange={() => closeModal('vente')}
        title="Top marques vente"
        columns={[
          { key: "marque", label: "Marque" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          { key: "unites", label: "Unités" },
        ]}
        data={venteMarqueData.filter(item => item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.assistance || false}
        onOpenChange={() => closeModal('assistance')}
        title="Contrats assistance"
        columns={[
          { key: "marque", label: "Marque" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          { key: "contrats", label: "Contrats" },
        ]}
        data={assistanceMarqueData.filter(item => item.marque.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.entretien || false}
        onOpenChange={() => closeModal('entretien')}
        title="Répartition entretien"
        columns={[
          { key: "typologie", label: "Type" },
          { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          { key: "part", label: "Part" },
        ]}
        data={entretienTypologieData.filter(item => item.typologie.toLowerCase().includes(filters.searchProduct?.toLowerCase() || ''))}
        variant="equipement"
      />
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal('evolution')}
        title="Évolution Mensuelle Équipement"
        columns={[
          { key: "mois", label: "Mois" },
          { key: "location", label: "Location", format: (v) => `${(v || 0).toLocaleString()}€` },
          { key: "vente", label: "Vente", format: (v) => `${(v || 0).toLocaleString()}€` },
          { key: "assistance", label: "Assistance", format: (v) => `${(v || 0).toLocaleString()}€` },
          { key: "entretien", label: "Entretien", format: (v) => `${(v || 0).toLocaleString()}€` },
        ]}
        data={evolutionMensuelleData}
        variant="equipement"
      />
    </div >
  );
}



