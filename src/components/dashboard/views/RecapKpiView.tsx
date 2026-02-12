import { BaseKpiCard } from "../cards/BaseKpiCard";
import { ClickableChart } from "../charts/ClickableChart";
import { Coffee, Euro, TrendingUp, Building2, Zap, User } from "lucide-react";
import type { FilterState } from "@/types";
import { useState } from "react";
import { DataTableModal } from "../modals/DataTableModal";
import { TableColumn } from "@/types";

interface RecapKpiViewProps {
  filters: FilterState;
  isComparing: boolean;
}

// Mock data for KPI Strategic recap
const globalKpiData = [
  { mois: "Janvier", gc: 248000, pp: 48000, b2c: 24000, total: 320000 },
  { mois: "Février", gc: 262000, pp: 52000, b2c: 26000, total: 340000 },
  { mois: "Mars", gc: 272000, pp: 54500, b2c: 27500, total: 354000 },
  { mois: "Avril", gc: 280000, pp: 56000, b2c: 28000, total: 364000 },
  { mois: "Mai", gc: 290000, pp: 57000, b2c: 28500, total: 375500 },
  { mois: "Juin", gc: 298000, pp: 58000, b2c: 29000, total: 385000 },
];

const revenueChartData = [
  { name: "Jan", value: 320000 },
  { name: "Fév", value: 340000 },
  { name: "Mar", value: 354000 },
  { name: "Avr", value: 364000 },
  { name: "Mai", value: 375500 },
  { name: "Juin", value: 385000 },
];

const previousRevenueData = [
  { name: "Jan", value: 290000 },
  { name: "Fév", value: 305000 },
  { name: "Mar", value: 318000 },
  { name: "Avr", value: 332000 },
  { name: "Mai", value: 345000 },
  { name: "Juin", value: 358000 },
];

const segmentGCData = [
  { kpi: "ARR", actuel: "2,98M€", precedent: "2,75M€", variation: "+8.2%" },
  { kpi: "Clients actifs", actuel: "47", precedent: "42", variation: "+11.9%" },
  { kpi: "Adoption interne", actuel: "72%", precedent: "68%", variation: "+4pts" },
  { kpi: "CA moyen/client", actuel: "63k€", precedent: "65k€", variation: "-3.1%" },
];

const segmentPPData = [
  { kpi: "MRR", actuel: "58k€", precedent: "52k€", variation: "+11.5%" },
  { kpi: "Clients actifs", actuel: "237", precedent: "198", variation: "+19.7%" },
  { kpi: "Churn 90j", actuel: "8%", precedent: "9.2%", variation: "-1.2pts" },
  { kpi: "Activation J30", actuel: "87%", precedent: "84%", variation: "+3pts" },
];

const segmentB2CData = [
  { kpi: "MRR", actuel: "29k€", precedent: "26k€", variation: "+11.5%" },
  { kpi: "Abonnés actifs", actuel: "1,247", precedent: "1,089", variation: "+14.5%" },
  { kpi: "Rétention 6m", actuel: "73%", precedent: "70%", variation: "+3pts" },
  { kpi: "NPS", actuel: "62", precedent: "58", variation: "+4pts" },
];

export function RecapKpiView({ filters, isComparing }: RecapKpiViewProps) {
  const [segmentModal, setSegmentModal] = useState<"gc" | "pp" | "b2c" | null>(null);

  const segmentColumns: TableColumn[] = [
    { key: "kpi", label: "KPI" },
    { key: "actuel", label: "Actuel" },
    { key: "precedent", label: "Précédent" },
    { key: "variation", label: "Variation" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="section-title">Récapitulatif KPI Stratégique</h2>
        <p className="text-muted-foreground text-sm">Vue consolidée des segments Grands Comptes, Plug & Play et B2C</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BaseKpiCard
          label="CA Total Récurrent"
          value="385k€"
          previousValue="358k€"
          trend={7.5}
          icon={<Euro className="h-5 w-5 text-primary" />}
          showComparison={isComparing}
          tableTitle="Évolution CA par segment"
          tableColumns={[
            { key: "mois", label: "Mois" },
            { key: "gc", label: "GC", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            { key: "pp", label: "P&P", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            { key: "b2c", label: "B2C", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            { key: "total", label: "Total", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          ]}
          tableData={globalKpiData}
        />
        <BaseKpiCard
          label="Clients Grands Comptes"
          value="47"
          previousValue="42"
          trend={11.9}
          icon={<Building2 className="h-5 w-5 text-segment-gc" />}
          showComparison={isComparing}
          tableTitle="Détails Grands Comptes"
          tableColumns={segmentColumns}
          tableData={segmentGCData}
        />
        <BaseKpiCard
          label="Clients Plug & Play"
          value="237"
          previousValue="198"
          trend={19.7}
          icon={<Zap className="h-5 w-5 text-segment-pp" />}
          showComparison={isComparing}
          tableTitle="Détails Plug & Play"
          tableColumns={segmentColumns}
          tableData={segmentPPData}
        />
        <BaseKpiCard
          label="Abonnés B2C"
          value="1,247"
          previousValue="1,089"
          trend={14.5}
          icon={<User className="h-5 w-5 text-segment-b2c" />}
          showComparison={isComparing}
          tableTitle="Détails B2C"
          tableColumns={segmentColumns}
          tableData={segmentB2CData}
        />
      </div>

      {/* Segment cards */}
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
              <span className="text-sm text-muted-foreground">Churn</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">8%</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 9.2%</span>}
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
              <span className="text-sm text-muted-foreground">NPS</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">62</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 58</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ClickableChart
        title="Évolution du CA récurrent consolidé"
        currentData={revenueChartData}
        previousData={previousRevenueData}
        showComparison={isComparing}
        currentLabel="2024"
        previousLabel="2023"
        valueSuffix="€"
      />

      {/* Modals */}
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



