import { BaseKpiCard } from "../cards/BaseKpiCard";
import { ClickableChart } from "../charts/ClickableChart";
import { ImpactCard } from "../cards/ImpactCard";
import { Coffee, Euro, Leaf, TrendingUp, Building2, Zap, User } from "lucide-react";
import type { FilterState } from "@/types";
import { useState } from "react";
import { DataTableModal } from "../modals/DataTableModal";
import { TableColumn } from "@/types";

interface OverviewViewProps {
  filters: FilterState;
  isComparing: boolean;
}

// Mock data - in real app, this would come from API based on filters
const currentRevenueData = [
  { name: "Jan", value: 320000 },
  { name: "Fév", value: 345000 },
  { name: "Mar", value: 358000 },
  { name: "Avr", value: 372000 },
  { name: "Mai", value: 385000 },
  { name: "Juin", value: 398000 },
];

const previousRevenueData = [
  { name: "Jan", value: 290000 },
  { name: "Fév", value: 310000 },
  { name: "Mar", value: 325000 },
  { name: "Avr", value: 340000 },
  { name: "Mai", value: 355000 },
  { name: "Juin", value: 368000 },
];

const currentUsageData = [
  { name: "Jan", value: 145000 },
  { name: "Fév", value: 152000 },
  { name: "Mar", value: 160000 },
  { name: "Avr", value: 168000 },
  { name: "Mai", value: 175000 },
  { name: "Juin", value: 178000 },
];

const previousUsageData = [
  { name: "Jan", value: 128000 },
  { name: "Fév", value: 135000 },
  { name: "Mar", value: 142000 },
  { name: "Avr", value: 150000 },
  { name: "Mai", value: 158000 },
  { name: "Juin", value: 165000 },
];

// Table data for KPIs
const tassesTableData = [
  { mois: "Janvier", gc: 52000, pp: 45000, b2c: 48000, total: 145000 },
  { mois: "Février", gc: 54000, pp: 48000, b2c: 50000, total: 152000 },
  { mois: "Mars", gc: 57000, pp: 51000, b2c: 52000, total: 160000 },
  { mois: "Avril", gc: 59000, pp: 54000, b2c: 55000, total: 168000 },
  { mois: "Mai", gc: 61000, pp: 57000, b2c: 57000, total: 175000 },
  { mois: "Juin", gc: 63000, pp: 58000, b2c: 57000, total: 178000 },
];

const ococTableData = [
  { mois: "Janvier", montant: 9800, projets: 4, arbres: 2240 },
  { mois: "Février", montant: 10200, projets: 4, arbres: 2330 },
  { mois: "Mars", montant: 10850, projets: 5, arbres: 2480 },
  { mois: "Avril", montant: 11300, projets: 5, arbres: 2580 },
  { mois: "Mai", montant: 11900, projets: 5, arbres: 2720 },
  { mois: "Juin", montant: 12450, projets: 6, arbres: 2847 },
];

const revenueTableData = [
  { mois: "Janvier", gc: 248000, pp: 48000, b2c: 24000, total: 320000 },
  { mois: "Février", gc: 262000, pp: 52000, b2c: 26000, total: 345000 },
  { mois: "Mars", gc: 272000, pp: 54500, b2c: 27500, total: 358000 },
  { mois: "Avril", gc: 280000, pp: 56000, b2c: 28000, total: 372000 },
  { mois: "Mai", gc: 290000, pp: 57000, b2c: 28500, total: 385000 },
  { mois: "Juin", gc: 298000, pp: 58000, b2c: 29000, total: 398000 },
];

const engagementTableData = [
  { segment: "Grands Comptes", clients: 47, engages: 32, taux: "68%" },
  { segment: "Plug & Play", clients: 237, engages: 148, taux: "62%" },
  { segment: "B2C", clients: 1247, engages: 798, taux: "64%" },
  { segment: "Total", clients: 1531, engages: 978, taux: "64%" },
];

const segmentGCData = [
  { kpi: "ARR", actuel: "2,98M€", precedent: "2,75M€", variation: "+8.2%" },
  { kpi: "Tasses/mois", actuel: "178k", precedent: "165k", variation: "+7.8%" },
  { kpi: "Adoption", actuel: "72%", precedent: "68%", variation: "+4pts" },
];

const segmentPPData = [
  { kpi: "MRR", actuel: "58k€", precedent: "52k€", variation: "+11.5%" },
  { kpi: "Churn 90j", actuel: "8%", precedent: "9.2%", variation: "-1.2pts" },
  { kpi: "Activation", actuel: "87%", precedent: "84%", variation: "+3pts" },
];

const segmentB2CData = [
  { kpi: "MRR", actuel: "29k€", precedent: "26k€", variation: "+11.5%" },
  { kpi: "Rétention 6m", actuel: "73%", precedent: "70%", variation: "+3pts" },
  { kpi: "NPS", actuel: "62", precedent: "58", variation: "+4pts" },
];

export function OverviewView({ filters, isComparing }: OverviewViewProps) {
  const [segmentModal, setSegmentModal] = useState<"gc" | "pp" | "b2c" | null>(null);

  const segmentColumns: TableColumn[] = [
    { key: "kpi", label: "KPI" },
    { key: "actuel", label: "Actuel" },
    { key: "precedent", label: "Précédent" },
    { key: "variation", label: "Variation" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero KPIs transverses */}
      <div>
        <h2 className="section-title">Vue globale – Plateforme CSC/LCC</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BaseKpiCard
            label="Tasses totales / mois"
            value="178k"
            previousValue="165k"
            trend={6.2}
            icon={<Coffee className="h-5 w-5 text-primary" />}
            showComparison={isComparing}
            tableTitle="Détail consommation par segment"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "gc", label: "Grands Comptes", format: (v) => (v || 0).toLocaleString() },
              { key: "pp", label: "Plug & Play", format: (v) => (v || 0).toLocaleString() },
              { key: "b2c", label: "B2C", format: (v) => (v || 0).toLocaleString() },
              { key: "total", label: "Total", format: (v) => (v || 0).toLocaleString() },
            ]}
            tableData={tassesTableData}
          />
          <BaseKpiCard
            label="€ OCOC générés / mois"
            value="12,450€"
            previousValue="11,320€"
            trend={9.8}
            icon={<Leaf className="h-5 w-5 text-segment-b2c" />}
            showComparison={isComparing}
            tableTitle="Historique OCOC"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "montant", label: "Montant", format: (v) => `${(v || 0).toLocaleString()}€` },
              { key: "projets", label: "Projets actifs" },
              { key: "arbres", label: "Arbres financés", format: (v) => (v || 0).toLocaleString() },
            ]}
            tableData={ococTableData}
          />
          <BaseKpiCard
            label="CA récurrent total"
            value="385k€"
            previousValue="359k€"
            trend={7.1}
            icon={<Euro className="h-5 w-5 text-primary" />}
            showComparison={isComparing}
            tableTitle="Détail CA par segment"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "gc", label: "Grands Comptes", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "pp", label: "Plug & Play", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "b2c", label: "B2C", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "total", label: "Total", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            ]}
            tableData={revenueTableData}
          />
          <BaseKpiCard
            label="% clients engagés"
            value="64%"
            previousValue="61%"
            trend={4.5}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            showComparison={isComparing}
            tableTitle="Engagement par segment"
            tableColumns={[
              { key: "segment", label: "Segment" },
              { key: "clients", label: "Clients total" },
              { key: "engages", label: "Clients engagés" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={engagementTableData}
          />
        </div>
      </div>

      {/* Résumé par segment - clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="kpi-card border-l-4 border-l-segment-gc cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
          onClick={() => setSegmentModal("gc")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-segment-gc" />
              <h3 className="font-semibold">Grands Comptes</h3>
            </div>
            <span className="text-xs text-muted-foreground underline">Détails</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ARR</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">2,98M€</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 2,75M€</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tasses/mois</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">178k</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 165k</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Adoption</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">72%</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 68%</span>}
              </div>
            </div>
          </div>
        </div>

        <div
          className="kpi-card border-l-4 border-l-segment-pp cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
          onClick={() => setSegmentModal("pp")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-segment-pp" />
              <h3 className="font-semibold">Plug & Play</h3>
            </div>
            <span className="text-xs text-muted-foreground underline">Détails</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">MRR</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">58k€</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 52k€</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Churn 90j</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">8%</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 9.2%</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Activation</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">87%</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 84%</span>}
              </div>
            </div>
          </div>
        </div>

        <div
          className="kpi-card border-l-4 border-l-segment-b2c cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
          onClick={() => setSegmentModal("b2c")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-segment-b2c" />
              <h3 className="font-semibold">B2C</h3>
            </div>
            <span className="text-xs text-muted-foreground underline">Détails</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">MRR</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">29k€</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 26k€</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rétention 6m</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">73%</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 70%</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">NPS</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">62</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 58</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClickableChart
          title="Évolution du CA récurrent"
          currentData={currentRevenueData}
          previousData={previousRevenueData}
          showComparison={isComparing}
          currentLabel="2024"
          previousLabel="2023"
          valueSuffix="€"
        />
        <ClickableChart
          title="Consommation (tasses)"
          currentData={currentUsageData}
          previousData={previousUsageData}
          showComparison={isComparing}
          currentLabel="2024"
          previousLabel="2023"
        />
      </div>

      {/* Impact */}
      <ImpactCard totalOcoc={12450} trees={2847} co2={142} />

      {/* Segment modals */}
      <DataTableModal
        open={segmentModal === "gc"}
        onOpenChange={() => setSegmentModal(null)}
        title="Grands Comptes - KPIs détaillés"
        columns={segmentColumns}
        data={segmentGCData}
        variant="gc"
      />
      <DataTableModal
        open={segmentModal === "pp"}
        onOpenChange={() => setSegmentModal(null)}
        title="Plug & Play - KPIs détaillés"
        columns={segmentColumns}
        data={segmentPPData}
        variant="pp"
      />
      <DataTableModal
        open={segmentModal === "b2c"}
        onOpenChange={() => setSegmentModal(null)}
        title="B2C - KPIs détaillés"
        columns={segmentColumns}
        data={segmentB2CData}
        variant="b2c"
      />
    </div>
  );
}



