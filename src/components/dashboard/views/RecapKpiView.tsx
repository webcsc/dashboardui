import { BaseKpiCard } from "../cards/BaseKpiCard";
import { ClickableChart } from "../charts/ClickableChart";
import { Coffee, Euro, TrendingUp, Building2, Zap, User } from "lucide-react";
import type { FilterState } from "@/types";
import { useState } from "react";
import { DataTableModal } from "../modals/DataTableModal";
import { TableColumn } from "@/types";
import {
  MOCK_RECAP_KPI,
  MOCK_GRANDS_COMPTES,
  MOCK_PLUG_PLAY,
  MOCK_B2C,
} from "@/services/mock-kpi-strategic";

interface RecapKpiViewProps {
  filters: FilterState;
  isComparing: boolean;
}

// Extract data from mock for easier access
const mockData = MOCK_RECAP_KPI;

// Mock data for KPI Strategic recap
const globalKpiData = mockData.ca_total_recurrent.evolution;

const revenueChartData = mockData.ca_total_recurrent.evolution.map((item) => ({
  name: item.mois.substring(0, 3),
  value: item.total,
}));

const previousRevenueData = [
  { name: "Jan", value: 290000 },
  { name: "Fév", value: 305000 },
  { name: "Mar", value: 318000 },
  { name: "Avr", value: 332000 },
  { name: "Mai", value: 345000 },
  { name: "Juin", value: 358000 },
];

const segmentGCData = mockData.segment_gc.kpis;
const segmentPPData = mockData.segment_pp.kpis;
const segmentB2CData = mockData.segment_b2c.kpis;

export function RecapKpiView({ filters, isComparing }: RecapKpiViewProps) {
  const [segmentModal, setSegmentModal] = useState<"gc" | "pp" | "b2c" | null>(
    null,
  );

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
        <p className="text-muted-foreground text-sm">
          Vue consolidée des segments Grands Comptes, Plug & Play et B2C
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BaseKpiCard
          label="CA Total Récurrent"
          value={`${(mockData.ca_total_recurrent.current / 1000).toFixed(0)}k€`}
          previousValue={`${(mockData.ca_total_recurrent.previous / 1000).toFixed(0)}k€`}
          trend={mockData.ca_total_recurrent.trend}
          icon={<Euro className="h-5 w-5 text-primary" />}
          showComparison={isComparing}
          tableTitle="Évolution CA par segment"
          tableColumns={[
            { key: "mois", label: "Mois" },
            {
              key: "gc",
              label: "GC",
              format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`,
            },
            {
              key: "pp",
              label: "P&P",
              format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`,
            },
            {
              key: "b2c",
              label: "B2C",
              format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`,
            },
            {
              key: "total",
              label: "Total",
              format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`,
            },
          ]}
          tableData={globalKpiData}
        />
        <BaseKpiCard
          label="Clients Grands Comptes"
          value={`${mockData.clients_grands_comptes.current}`}
          previousValue={`${mockData.clients_grands_comptes.previous}`}
          trend={mockData.clients_grands_comptes.trend}
          icon={<Building2 className="h-5 w-5 text-segment-gc" />}
          showComparison={isComparing}
          tableTitle="Détails Grands Comptes"
          tableColumns={segmentColumns}
          tableData={segmentGCData}
        />
        <BaseKpiCard
          label="Clients Plug & Play"
          value={`${mockData.clients_plug_play.current}`}
          previousValue={`${mockData.clients_plug_play.previous}`}
          trend={mockData.clients_plug_play.trend}
          icon={<Zap className="h-5 w-5 text-segment-pp" />}
          showComparison={isComparing}
          tableTitle="Détails Plug & Play"
          tableColumns={segmentColumns}
          tableData={segmentPPData}
        />
        <BaseKpiCard
          label="Abonnés B2C"
          value={`${mockData.abonnes_b2c.current.toLocaleString()}`}
          previousValue={`${mockData.abonnes_b2c.previous.toLocaleString()}`}
          trend={mockData.abonnes_b2c.trend}
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
            <span className="text-xs text-muted-foreground underline">
              Détails
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ARR</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${(MOCK_GRANDS_COMPTES.arr.current / 1000000).toFixed(2)}M€`}</span>
                {isComparing && (
                  <span className="text-xs text-muted-foreground">
                    vs{" "}
                    {`${(MOCK_GRANDS_COMPTES.arr.previous / 1000000).toFixed(2)}M€`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Adoption</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {MOCK_GRANDS_COMPTES.adoption_interne.current}%
                </span>
                {isComparing && (
                  <span className="text-xs text-muted-foreground">
                    vs {MOCK_GRANDS_COMPTES.adoption_interne.previous}%
                  </span>
                )}
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
            <span className="text-xs text-muted-foreground underline">
              Détails
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">MRR</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${(MOCK_PLUG_PLAY.mrr.current / 1000).toFixed(0)}k€`}</span>
                {isComparing && (
                  <span className="text-xs text-muted-foreground">
                    vs {`${(MOCK_PLUG_PLAY.mrr.previous / 1000).toFixed(0)}k€`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Churn</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {MOCK_PLUG_PLAY.churn_90j.current}%
                </span>
                {isComparing && (
                  <span className="text-xs text-muted-foreground">
                    vs {MOCK_PLUG_PLAY.churn_90j.previous}%
                  </span>
                )}
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
            <span className="text-xs text-muted-foreground underline">
              Détails
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">MRR</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{`${(MOCK_B2C.mrr_abonnements.current / 1000).toFixed(0)}k€`}</span>
                {isComparing && (
                  <span className="text-xs text-muted-foreground">
                    vs{" "}
                    {`${(MOCK_B2C.mrr_abonnements.previous / 1000).toFixed(0)}k€`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">NPS</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{MOCK_B2C.nps.current}</span>
                {isComparing && (
                  <span className="text-xs text-muted-foreground">
                    vs {MOCK_B2C.nps.previous}
                  </span>
                )}
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
