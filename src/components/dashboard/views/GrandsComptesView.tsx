import { useState } from "react";
import { SimpleKpiCard } from "../cards/SimpleKpiCard";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import {
  Building2,
  TrendingUp,
  Coffee,
  Users,
  Euro,
  Clock,
  Target,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { FilterState } from "@/types";
import { DataTableModal } from "../modals/DataTableModal";
import { TableColumn } from "@/types";
import { ImpactCard } from "../cards/ImpactCard";
import { MOCK_GRANDS_COMPTES } from "@/services/mock-kpi-strategic";

interface GrandsComptesViewProps {
  filters: FilterState;
  isComparing: boolean;
}

// Extract data from mock for easier access
const mockData = MOCK_GRANDS_COMPTES;

// Transform data for charts
const revenueData = mockData.arr.evolution.map((item) => ({
  month: item.month.substring(0, 3),
  arr: item.arr,
}));

const adoptionData = mockData.adoption_interne.par_client.map((item) => ({
  client: item.client,
  taux: parseInt(item.taux),
}));

// Table data (already in correct format in mock)
const arrTableData = mockData.arr.evolution;
const tassesGCData = mockData.tasses_mensuelles.details;
const adoptionTableData = mockData.adoption_interne.par_client;
const margeTableData = mockData.marge_client.details;
const ococGCData = mockData.ococ_client.details;

export function GrandsComptesView({
  filters,
  isComparing,
}: GrandsComptesViewProps) {
  const [arrModalOpen, setArrModalOpen] = useState(false);
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs prioritaires */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Building2 className="h-6 w-6 text-segment-gc" />
          Grands Comptes – KPIs Clés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BaseKpiCard
            label="ARR"
            value={`${(mockData.arr.current / 1000000).toFixed(2)}M€`}
            previousValue={`${(mockData.arr.previous / 1000000).toFixed(2)}M€`}
            trend={mockData.arr.trend}
            icon={<Euro className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Évolution ARR"
            tableColumns={[
              { key: "mois", label: "Mois" },
              {
                key: "arr",
                label: "ARR",
                format: (v) => `${((v || 0) / 1000000).toFixed(2)}M€`,
              },
              { key: "variation", label: "Variation" },
              { key: "clients", label: "Clients" },
            ]}
            tableData={arrTableData}
          />
          <BaseKpiCard
            label="Tasses / mois"
            value={`${(mockData.tasses_mensuelles.current / 1000).toFixed(0)}k`}
            previousValue={`${(mockData.tasses_mensuelles.previous / 1000).toFixed(0)}k`}
            trend={mockData.tasses_mensuelles.trend}
            icon={<Coffee className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Consommation mensuelle"
            tableColumns={[
              { key: "mois", label: "Mois" },
              {
                key: "tasses",
                label: "Tasses",
                format: (v) => (v || 0).toLocaleString(),
              },
              { key: "sites", label: "Sites" },
              {
                key: "moyenneSite",
                label: "Moy/site",
                format: (v) => (v || 0).toLocaleString(),
              },
            ]}
            tableData={tassesGCData}
          />
          <BaseKpiCard
            label="Adoption interne"
            value={`${mockData.adoption_interne.current}%`}
            previousValue={`${mockData.adoption_interne.previous}%`}
            trend={mockData.adoption_interne.trend}
            icon={<Users className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Adoption par client"
            tableColumns={[
              { key: "client", label: "Client" },
              { key: "collaborateurs", label: "Collaborateurs" },
              { key: "actifs", label: "Actifs" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={adoptionTableData}
          />
          <BaseKpiCard
            label="Marge / client"
            value={`${mockData.marge_client.current}%`}
            previousValue={`${mockData.marge_client.previous}%`}
            trend={mockData.marge_client.trend}
            icon={<Target className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Marge par client"
            tableColumns={[
              { key: "client", label: "Client" },
              {
                key: "ca",
                label: "CA",
                format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`,
              },
              {
                key: "marge",
                label: "Marge",
                format: (v) => `${((v || 0) / 1000).toFixed(0)}k€`,
              },
              { key: "tauxMarge", label: "Taux" },
            ]}
            tableData={margeTableData}
          />
          <BaseKpiCard
            label="€ OCOC / client"
            value={`${mockData.ococ_client.current}€`}
            previousValue={`${mockData.ococ_client.previous}€`}
            trend={mockData.ococ_client.trend}
            icon={<Building2 className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Impact OCOC par client"
            tableColumns={[
              { key: "client", label: "Client" },
              {
                key: "tasses",
                label: "Tasses",
                format: (v) => (v || 0).toLocaleString(),
              },
              { key: "ococ", label: "€ OCOC", format: (v) => `${v}€` },
              { key: "arbres", label: "Arbres" },
            ]}
            tableData={ococGCData}
          />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setArrModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Évolution ARR</h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(220, 55%, 35%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(220, 55%, 35%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                tickFormatter={(value) =>
                  `${((value || 0) / 1000000).toFixed(1)}M€`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [
                  `${((value || 0) / 1000000).toFixed(2)}M€`,
                  "ARR",
                ]}
              />
              <Area
                type="monotone"
                dataKey="arr"
                stroke="hsl(220, 55%, 35%)"
                fillOpacity={1}
                fill="url(#colorArr)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setAdoptionModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Taux d'adoption par client
            </h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={adoptionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
              />
              <YAxis
                dataKey="client"
                type="category"
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [`${value}%`, "Adoption"]}
              />
              <Bar
                dataKey="taux"
                fill="hsl(220, 55%, 35%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPIs secondaires */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Opérations & Marketing</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SimpleKpiCard
            label="Sites actifs"
            value="47"
            trend={4}
            icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Sites actifs par région"
            tableColumns={[
              { key: "region", label: "Région" },
              { key: "sites", label: "Sites" },
              {
                key: "tasses",
                label: "Tasses/mois",
                format: (v) => (v || 0).toLocaleString(),
              },
            ]}
            tableData={[
              { region: "Île-de-France", sites: 18, tasses: 72000 },
              { region: "Auvergne-Rhône-Alpes", sites: 8, tasses: 28000 },
              { region: "PACA", sites: 6, tasses: 22000 },
              { region: "Hauts-de-France", sites: 5, tasses: 18000 },
              { region: "Autres", sites: 10, tasses: 38000 },
            ]}
          />
          <SimpleKpiCard
            label="SLA respectés"
            value="94%"
            trend={2.1}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Respect SLA par type"
            tableColumns={[
              { key: "type", label: "Type intervention" },
              { key: "total", label: "Total" },
              { key: "respectes", label: "Respectés" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={[
              {
                type: "Maintenance préventive",
                total: 120,
                respectes: 118,
                taux: "98%",
              },
              {
                type: "Dépannage urgent",
                total: 45,
                respectes: 40,
                taux: "89%",
              },
              { type: "Installation", total: 8, respectes: 8, taux: "100%" },
              { type: "Réassort", total: 180, respectes: 168, taux: "93%" },
            ]}
          />
          <SimpleKpiCard
            label="Cycle de vente"
            value="68 jours"
            trend={-12}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Pipeline commercial"
            tableColumns={[
              { key: "etape", label: "Étape" },
              { key: "deals", label: "Deals" },
              { key: "duree", label: "Durée moy." },
            ]}
            tableData={[
              { etape: "Lead qualifié", deals: 24, duree: "0 jours" },
              { etape: "Premier RDV", deals: 18, duree: "8 jours" },
              { etape: "Proposition", deals: 12, duree: "25 jours" },
              { etape: "Négociation", deals: 8, duree: "52 jours" },
              { etape: "Closing", deals: 5, duree: "68 jours" },
            ]}
          />
          <SimpleKpiCard
            label="Études de cas"
            value="12"
            trend={20}
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Études de cas publiées"
            tableColumns={[
              { key: "client", label: "Client" },
              { key: "secteur", label: "Secteur" },
              { key: "date", label: "Date" },
            ]}
            tableData={[
              { client: "TechCorp", secteur: "IT", date: "Jan 2024" },
              { client: "BankPlus", secteur: "Finance", date: "Fév 2024" },
              { client: "HealthFirst", secteur: "Santé", date: "Mar 2024" },
              {
                client: "RetailMax",
                secteur: "Distribution",
                date: "Avr 2024",
              },
            ]}
          />
        </div>
      </div>

      {/* Modals for charts */}
      <DataTableModal
        open={arrModalOpen}
        onOpenChange={setArrModalOpen}
        title="Données ARR"
        columns={[
          { key: "month", label: "Mois" },
          {
            key: "arr",
            label: "ARR",
            format: (v) => `${((v || 0) / 1000000).toFixed(2)}M€`,
          },
        ]}
        data={revenueData}
        variant="gc"
      />
      <DataTableModal
        open={adoptionModalOpen}
        onOpenChange={setAdoptionModalOpen}
        title="Taux d'adoption par client"
        columns={[
          { key: "client", label: "Client" },
          { key: "taux", label: "Taux d'adoption", format: (v) => `${v}%` },
        ]}
        data={adoptionData}
        variant="gc"
      />
    </div>
  );
}
