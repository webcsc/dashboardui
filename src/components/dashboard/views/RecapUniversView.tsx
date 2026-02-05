import { BaseKpiCard } from "../cards/BaseKpiCard";
import { ClickableChart } from "../charts/ClickableChart";
import { Coffee, Settings, Wrench, Euro, TrendingUp } from "lucide-react";
import type { FilterState } from "@/types";
import { useState } from "react";
import { DataTableModal, TableColumn } from "../modals/DataTableModal";

interface RecapUniversViewProps {
  filters: FilterState;
  isComparing: boolean;
}

// Mock data for Universe recap
const globalUniversData = [
  { mois: "Janvier", cafe: 185000, equipement: 78000, service: 42000, total: 305000 },
  { mois: "Février", cafe: 192000, equipement: 82000, service: 45000, total: 319000 },
  { mois: "Mars", cafe: 198000, equipement: 85000, service: 48000, total: 331000 },
  { mois: "Avril", cafe: 205000, equipement: 88000, service: 51000, total: 344000 },
  { mois: "Mai", cafe: 210000, equipement: 92000, service: 53000, total: 355000 },
  { mois: "Juin", cafe: 218000, equipement: 95000, service: 56000, total: 369000 },
];

const revenueChartData = [
  { name: "Jan", value: 305000 },
  { name: "Fév", value: 319000 },
  { name: "Mar", value: 331000 },
  { name: "Avr", value: 344000 },
  { name: "Mai", value: 355000 },
  { name: "Juin", value: 369000 },
];

const previousRevenueData = [
  { name: "Jan", value: 275000 },
  { name: "Fév", value: 288000 },
  { name: "Mar", value: 298000 },
  { name: "Avr", value: 312000 },
  { name: "Mai", value: 325000 },
  { name: "Juin", value: 338000 },
];

const cafeDetailData = [
  { kpi: "CA Mensuel", actuel: "218k€", precedent: "195k€", variation: "+11.8%" },
  { kpi: "Volume (kg)", actuel: "4,850", precedent: "4,320", variation: "+12.3%" },
  { kpi: "Part Grains", actuel: "68%", precedent: "65%", variation: "+3pts" },
  { kpi: "Marge brute", actuel: "42%", precedent: "40%", variation: "+2pts" },
];

const equipementDetailData = [
  { kpi: "CA Mensuel", actuel: "95k€", precedent: "82k€", variation: "+15.9%" },
  { kpi: "Machines louées", actuel: "312", precedent: "278", variation: "+12.2%" },
  { kpi: "Assist. Premium", actuel: "187", precedent: "156", variation: "+19.9%" },
  { kpi: "Taux location", actuel: "78%", precedent: "74%", variation: "+4pts" },
];

const serviceDetailData = [
  { kpi: "CA Mensuel", actuel: "56k€", precedent: "48k€", variation: "+16.7%" },
  { kpi: "Interventions", actuel: "234", precedent: "198", variation: "+18.2%" },
  { kpi: "Taux résol. J1", actuel: "92%", precedent: "88%", variation: "+4pts" },
  { kpi: "Satisfaction", actuel: "4.7/5", precedent: "4.5/5", variation: "+0.2" },
];

export function RecapUniversView({ filters, isComparing }: RecapUniversViewProps) {
  const [universModal, setUniversModal] = useState<"cafe" | "equipement" | "service" | null>(null);

  const universColumns: TableColumn[] = [
    { key: "kpi", label: "KPI" },
    { key: "actuel", label: "Actuel" },
    { key: "precedent", label: "Précédent" },
    { key: "variation", label: "Variation" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="section-title">Récapitulatif par Univers</h2>
        <p className="text-muted-foreground text-sm">Vue consolidée des univers Café, Équipement et Service</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BaseKpiCard
          label="CA Total Univers"
          value="369k€"
          previousValue="338k€"
          trend={9.2}
          icon={<Euro className="h-5 w-5 text-primary" />}
          showComparison={isComparing}
          tableTitle="Évolution CA par univers"
          tableColumns={[
            { key: "mois", label: "Mois" },
            { key: "cafe", label: "Café", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            { key: "equipement", label: "Équipement", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            { key: "service", label: "Service", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
            { key: "total", label: "Total", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
          ]}
          tableData={globalUniversData}
        />
        <BaseKpiCard
          label="CA Univers Café"
          value="218k€"
          previousValue="195k€"
          trend={11.8}
          icon={<Coffee className="h-5 w-5 text-universe-cafe" />}
          showComparison={isComparing}
          tableTitle="Détails Café"
          tableColumns={universColumns}
          tableData={cafeDetailData}
        />
        <BaseKpiCard
          label="CA Équipement"
          value="95k€"
          previousValue="82k€"
          trend={15.9}
          icon={<Settings className="h-5 w-5 text-universe-equipement" />}
          showComparison={isComparing}
          tableTitle="Détails Équipement"
          tableColumns={universColumns}
          tableData={equipementDetailData}
        />
        <BaseKpiCard
          label="CA Service"
          value="56k€"
          previousValue="48k€"
          trend={16.7}
          icon={<Wrench className="h-5 w-5 text-universe-service" />}
          showComparison={isComparing}
          tableTitle="Détails Service"
          tableColumns={universColumns}
          tableData={serviceDetailData}
        />
      </div>

      {/* Univers cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="kpi-card border-l-4 border-l-universe-cafe cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
          onClick={() => setUniversModal("cafe")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-universe-cafe" />
              <h3 className="font-semibold">Café</h3>
            </div>
            <span className="text-xs text-muted-foreground underline">Détails</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CA Mensuel</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">218k€</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 195k€</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Volume</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">4,850 kg</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 4,320 kg</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Part de marché</span>
              <span className="font-semibold">59%</span>
            </div>
          </div>
        </div>

        <div
          className="kpi-card border-l-4 border-l-universe-equipement cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
          onClick={() => setUniversModal("equipement")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-universe-equipement" />
              <h3 className="font-semibold">Équipement</h3>
            </div>
            <span className="text-xs text-muted-foreground underline">Détails</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CA Mensuel</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">95k€</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 82k€</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Machines</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">312</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 278</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Part de marché</span>
              <span className="font-semibold">26%</span>
            </div>
          </div>
        </div>

        <div
          className="kpi-card border-l-4 border-l-universe-service cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
          onClick={() => setUniversModal("service")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-universe-service" />
              <h3 className="font-semibold">Service</h3>
            </div>
            <span className="text-xs text-muted-foreground underline">Détails</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CA Mensuel</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">56k€</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 48k€</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Interventions</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">234</span>
                {isComparing && <span className="text-xs text-muted-foreground">vs 198</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Part de marché</span>
              <span className="font-semibold">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ClickableChart
        title="Évolution du CA par univers"
        currentData={revenueChartData}
        previousData={previousRevenueData}
        showComparison={isComparing}
        currentLabel="2024"
        previousLabel="2023"
        valueSuffix="€"
      />

      {/* Modals */}
      <DataTableModal
        open={universModal === "cafe"}
        onOpenChange={() => setUniversModal(null)}
        title="Univers Café - KPIs détaillés"
        columns={universColumns}
        data={cafeDetailData}
        variant="cafe"
      />
      <DataTableModal
        open={universModal === "equipement"}
        onOpenChange={() => setUniversModal(null)}
        title="Univers Équipement - KPIs détaillés"
        columns={universColumns}
        data={equipementDetailData}
        variant="equipement"
      />
      <DataTableModal
        open={universModal === "service"}
        onOpenChange={() => setUniversModal(null)}
        title="Univers Service - KPIs détaillés"
        columns={universColumns}
        data={serviceDetailData}
        variant="service"
      />
    </div>
  );
}



