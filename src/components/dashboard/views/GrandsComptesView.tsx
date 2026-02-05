import { useState } from "react";
import { SimpleKpiCard } from "../cards/SimpleKpiCard";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { Building2, TrendingUp, Coffee, Users, Euro, Clock, Target, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { FilterState } from "@/types";
import { DataTableModal, TableColumn } from "../modals/DataTableModal";
import { ImpactCard } from "../cards/ImpactCard";

interface GrandsComptesViewProps {
  filters: FilterState;
  isComparing: boolean;
}

const revenueData = [
  { month: "Jan", arr: 2450000 },
  { month: "Fév", arr: 2580000 },
  { month: "Mar", arr: 2670000 },
  { month: "Avr", arr: 2750000 },
  { month: "Mai", arr: 2890000 },
  { month: "Juin", arr: 2980000 },
];

const adoptionData = [
  { client: "Client A", taux: 78 },
  { client: "Client B", taux: 65 },
  { client: "Client C", taux: 92 },
  { client: "Client D", taux: 54 },
  { client: "Client E", taux: 88 },
];

// Table data
const arrTableData = [
  { mois: "Janvier", arr: 2450000, variation: "+5.2%", clients: 42 },
  { mois: "Février", arr: 2580000, variation: "+5.3%", clients: 43 },
  { mois: "Mars", arr: 2670000, variation: "+3.5%", clients: 44 },
  { mois: "Avril", arr: 2750000, variation: "+3.0%", clients: 45 },
  { mois: "Mai", arr: 2890000, variation: "+5.1%", clients: 46 },
  { mois: "Juin", arr: 2980000, variation: "+3.1%", clients: 47 },
];

const tassesGCData = [
  { mois: "Janvier", tasses: 162000, sites: 42, moyenneSite: 3857 },
  { mois: "Février", tasses: 165000, sites: 43, moyenneSite: 3837 },
  { mois: "Mars", tasses: 168000, sites: 44, moyenneSite: 3818 },
  { mois: "Avril", tasses: 172000, sites: 45, moyenneSite: 3822 },
  { mois: "Mai", tasses: 175000, sites: 46, moyenneSite: 3804 },
  { mois: "Juin", tasses: 178000, sites: 47, moyenneSite: 3787 },
];

const adoptionTableData = [
  { client: "Client A", collaborateurs: 1200, actifs: 936, taux: "78%" },
  { client: "Client B", collaborateurs: 800, actifs: 520, taux: "65%" },
  { client: "Client C", collaborateurs: 2500, actifs: 2300, taux: "92%" },
  { client: "Client D", collaborateurs: 450, actifs: 243, taux: "54%" },
  { client: "Client E", collaborateurs: 1800, actifs: 1584, taux: "88%" },
];

const margeTableData = [
  { client: "Client A", ca: 245000, marge: 83300, tauxMarge: "34%" },
  { client: "Client B", ca: 180000, marge: 59400, tauxMarge: "33%" },
  { client: "Client C", ca: 520000, marge: 182000, tauxMarge: "35%" },
  { client: "Client D", ca: 95000, marge: 30400, tauxMarge: "32%" },
  { client: "Client E", ca: 320000, marge: 112000, tauxMarge: "35%" },
];

const ococGCData = [
  { client: "Client A", tasses: 28000, ococ: 280, arbres: 64 },
  { client: "Client B", tasses: 18500, ococ: 185, arbres: 42 },
  { client: "Client C", tasses: 52000, ococ: 520, arbres: 119 },
  { client: "Client D", tasses: 9200, ococ: 92, arbres: 21 },
  { client: "Client E", tasses: 34000, ococ: 340, arbres: 78 },
];

export function GrandsComptesView({ filters, isComparing }: GrandsComptesViewProps) {
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
            value="2,98M€"
            previousValue="2,75M€"
            trend={8.2}
            icon={<Euro className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Évolution ARR"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "arr", label: "ARR", format: (v) => `${((v || 0) / 1000000).toFixed(2)}M€` },
              { key: "variation", label: "Variation" },
              { key: "clients", label: "Clients" },
            ]}
            tableData={arrTableData}
          />
          <BaseKpiCard
            label="Tasses / mois"
            value="178k"
            previousValue="165k"
            trend={5.9}
            icon={<Coffee className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Consommation mensuelle"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "tasses", label: "Tasses", format: (v) => (v || 0).toLocaleString() },
              { key: "sites", label: "Sites" },
              { key: "moyenneSite", label: "Moy/site", format: (v) => (v || 0).toLocaleString() },
            ]}
            tableData={tassesGCData}
          />
          <BaseKpiCard
            label="Adoption interne"
            value="72%"
            previousValue="68%"
            trend={3.4}
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
            value="34%"
            previousValue="33%"
            trend={1.2}
            icon={<Target className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Marge par client"
            tableColumns={[
              { key: "client", label: "Client" },
              { key: "ca", label: "CA", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "marge", label: "Marge", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "tauxMarge", label: "Taux" },
            ]}
            tableData={margeTableData}
          />
          <BaseKpiCard
            label="€ OCOC / client"
            value="842€"
            previousValue="748€"
            trend={12.5}
            icon={<Building2 className="h-5 w-5 text-segment-gc" />}
            variant="gc"
            showComparison={isComparing}
            tableTitle="Impact OCOC par client"
            tableColumns={[
              { key: "client", label: "Client" },
              { key: "tasses", label: "Tasses", format: (v) => (v || 0).toLocaleString() },
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
            <span className="text-xs text-muted-foreground underline">Voir tableau</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220, 55%, 35%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(220, 55%, 35%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                tickFormatter={(value) => `${((value || 0) / 1000000).toFixed(1)}M€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [`${((value || 0) / 1000000).toFixed(2)}M€`, "ARR"]}
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
            <h3 className="text-lg font-semibold">Taux d'adoption par client</h3>
            <span className="text-xs text-muted-foreground underline">Voir tableau</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={adoptionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis type="number" domain={[0, 100]} stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis dataKey="client" type="category" stroke="hsl(25, 15%, 45%)" fontSize={12} width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [`${value}%`, "Adoption"]}
              />
              <Bar dataKey="taux" fill="hsl(220, 55%, 35%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div >

      {/* KPIs secondaires */}
      < div >
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
              { key: "tasses", label: "Tasses/mois", format: (v) => (v || 0).toLocaleString() },
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
              { type: "Maintenance préventive", total: 120, respectes: 118, taux: "98%" },
              { type: "Dépannage urgent", total: 45, respectes: 40, taux: "89%" },
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
              { client: "RetailMax", secteur: "Distribution", date: "Avr 2024" },
            ]}
          />
        </div>
      </div >

      {/* Modals for charts */}
      < DataTableModal
        open={arrModalOpen}
        onOpenChange={setArrModalOpen}
        title="Données ARR"
        columns={
          [
            { key: "month", label: "Mois" },
            { key: "arr", label: "ARR", format: (v) => `${((v || 0) / 1000000).toFixed(2)}M€` },
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
    </div >
  );
}



