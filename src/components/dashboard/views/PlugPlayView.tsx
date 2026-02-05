import { useState } from "react";
import { SimpleKpiCard } from "../cards/SimpleKpiCard";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import { Zap, Coffee, TrendingDown, Euro, Target, Clock, HeadphonesIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { FilterState } from "@/types";
import { DataTableModal } from "../modals/DataTableModal";

interface PlugPlayViewProps {
  filters: FilterState;
  isComparing: boolean;
}

const mrrData = [
  { month: "Jan", mrr: 42000 },
  { month: "Fév", mrr: 45000 },
  { month: "Mar", mrr: 48500 },
  { month: "Avr", mrr: 52000 },
  { month: "Mai", mrr: 55500 },
  { month: "Juin", mrr: 58000 },
];

const churnData = [
  { name: "Actifs", value: 92, color: "hsl(145, 45%, 35%)" },
  { name: "Churn 90j", value: 8, color: "hsl(0, 72%, 51%)" },
];

// Table data
const mrrTableData = [
  { mois: "Janvier", mrr: 42000, nouveaux: 12, churns: 3, net: 9 },
  { mois: "Février", mrr: 45000, nouveaux: 15, churns: 4, net: 11 },
  { mois: "Mars", mrr: 48500, nouveaux: 18, churns: 5, net: 13 },
  { mois: "Avril", mrr: 52000, nouveaux: 20, churns: 4, net: 16 },
  { mois: "Mai", mrr: 55500, nouveaux: 22, churns: 6, net: 16 },
  { mois: "Juin", mrr: 58000, nouveaux: 18, churns: 5, net: 13 },
];

const churnTableData = [
  { cohorte: "Janvier", inscrits: 45, actifs90j: 42, churns: 3, taux: "6.7%" },
  { cohorte: "Février", inscrits: 52, actifs90j: 47, churns: 5, taux: "9.6%" },
  { cohorte: "Mars", inscrits: 58, actifs90j: 53, churns: 5, taux: "8.6%" },
  { cohorte: "Avril", inscrits: 61, actifs90j: 56, churns: 5, taux: "8.2%" },
];

const arpaTableData = [
  { pack: "Starter", clients: 85, arpa: 195, part: "36%" },
  { pack: "Business", clients: 112, arpa: 265, part: "47%" },
  { pack: "Premium", clients: 40, arpa: 345, part: "17%" },
];

const serviceTableData = [
  { type: "Installation", tickets: 45, coutMoyen: 85, total: 3825 },
  { type: "Support téléphone", tickets: 180, coutMoyen: 12, total: 2160 },
  { type: "Intervention site", tickets: 28, coutMoyen: 65, total: 1820 },
  { type: "Réassort express", tickets: 15, coutMoyen: 25, total: 375 },
];

const activationTableData = [
  { semaine: "S1", inscrits: 15, actives: 12, taux: "80%" },
  { semaine: "S2", inscrits: 18, actives: 16, taux: "89%" },
  { semaine: "S3", inscrits: 22, actives: 20, taux: "91%" },
  { semaine: "S4", inscrits: 20, actives: 18, taux: "90%" },
];

export function PlugPlayView({ filters, isComparing }: PlugPlayViewProps) {
  const [mrrModalOpen, setMrrModalOpen] = useState(false);
  const [churnModalOpen, setChurnModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs prioritaires */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Zap className="h-6 w-6 text-segment-pp" />
          Plug & Play – KPIs Clés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BaseKpiCard
            label="MRR"
            value="58k€"
            previousValue="52k€"
            trend={4.5}
            icon={<Euro className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            tableTitle="Évolution MRR"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "mrr", label: "MRR", format: (v) => `${((v || 0) / 1000).toFixed(0)}k€` },
              { key: "nouveaux", label: "Nouveaux" },
              { key: "churns", label: "Churns" },
              { key: "net", label: "Net" },
            ]}
            tableData={mrrTableData}
          />
          <BaseKpiCard
            label="Churn 90 jours"
            value="8%"
            previousValue="9.2%"
            trend={-1.2}
            icon={<TrendingDown className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            tableTitle="Analyse churn par cohorte"
            tableColumns={[
              { key: "cohorte", label: "Cohorte" },
              { key: "inscrits", label: "Inscrits" },
              { key: "actifs90j", label: "Actifs 90j" },
              { key: "churns", label: "Churns" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={churnTableData}
          />
          <BaseKpiCard
            label="ARPA"
            value="245€"
            previousValue="236€"
            trend={3.8}
            icon={<Target className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            tableTitle="ARPA par pack"
            tableColumns={[
              { key: "pack", label: "Pack" },
              { key: "clients", label: "Clients" },
              { key: "arpa", label: "ARPA", format: (v) => `${v}€` },
              { key: "part", label: "Part" },
            ]}
            tableData={arpaTableData}
          />
          <BaseKpiCard
            label="Coût service / client"
            value="18€"
            previousValue="19€"
            trend={-5.2}
            icon={<HeadphonesIcon className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            tableTitle="Coûts service par type"
            tableColumns={[
              { key: "type", label: "Type" },
              { key: "tickets", label: "Tickets" },
              { key: "coutMoyen", label: "Coût moy.", format: (v) => `${v}€` },
              { key: "total", label: "Total", format: (v) => `${v}€` },
            ]}
            tableData={serviceTableData}
          />
          <BaseKpiCard
            label="Taux activation"
            value="87%"
            previousValue="84%"
            trend={6.4}
            icon={<Zap className="h-5 w-5 text-segment-pp" />}
            variant="pp"
            showComparison={isComparing}
            tableTitle="Activation par semaine"
            tableColumns={[
              { key: "semaine", label: "Semaine" },
              { key: "inscrits", label: "Inscrits" },
              { key: "actives", label: "Activés" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={activationTableData}
          />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setMrrModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Évolution MRR</h3>
            <span className="text-xs text-muted-foreground underline">Voir tableau</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mrrData}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(35, 85%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(35, 85%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                tickFormatter={(value) => `${((value || 0) / 1000).toFixed(0)}k€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [`${(value || 0).toLocaleString()}€`, "MRR"]}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="hsl(35, 85%, 50%)"
                fillOpacity={1}
                fill="url(#colorMrr)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setChurnModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Rétention à 90 jours</h3>
            <span className="text-xs text-muted-foreground underline">Voir tableau</span>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={churnData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {churnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(40, 25%, 99%)",
                    border: "1px solid hsl(35, 20%, 88%)",
                    borderRadius: "0.75rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPIs secondaires */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tunnel & Usage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SimpleKpiCard
            label="Abonnements actifs"
            value="237"
            trend={8.5}
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Répartition abonnements"
            tableColumns={[
              { key: "pack", label: "Pack" },
              { key: "actifs", label: "Actifs" },
              { key: "part", label: "Part" },
            ]}
            tableData={[
              { pack: "Starter", actifs: 85, part: "36%" },
              { pack: "Business", actifs: 112, part: "47%" },
              { pack: "Premium", actifs: 40, part: "17%" },
            ]}
          />
          <SimpleKpiCard
            label="Tasses / client / mois"
            value="420"
            trend={3.2}
            icon={<Coffee className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Consommation par pack"
            tableColumns={[
              { key: "pack", label: "Pack" },
              { key: "moyenne", label: "Moy. tasses" },
              { key: "incluses", label: "Incluses" },
            ]}
            tableData={[
              { pack: "Starter", moyenne: 280, incluses: 300 },
              { pack: "Business", moyenne: 450, incluses: 500 },
              { pack: "Premium", moyenne: 680, incluses: 800 },
            ]}
          />
          <SimpleKpiCard
            label="Délai installation"
            value="3.2 jours"
            trend={-15}
            trendLabel="amélioration"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Délais par région"
            tableColumns={[
              { key: "region", label: "Région" },
              { key: "delai", label: "Délai moy." },
              { key: "installations", label: "Installations" },
            ]}
            tableData={[
              { region: "Île-de-France", delai: "2.5 jours", installations: 35 },
              { region: "Lyon/Marseille", delai: "3.0 jours", installations: 22 },
              { region: "Autres", delai: "4.2 jours", installations: 18 },
            ]}
          />
          <SimpleKpiCard
            label="Taux upsell"
            value="24%"
            trend={5.8}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Upsells par type"
            tableColumns={[
              { key: "type", label: "Type upsell" },
              { key: "nombre", label: "Nombre" },
              { key: "revenus", label: "Revenus add.", format: (v) => `${v}€` },
            ]}
            tableData={[
              { type: "Pack supérieur", nombre: 28, revenus: 1960 },
              { type: "Options machine", nombre: 15, revenus: 750 },
              { type: "Cafés premium", nombre: 42, revenus: 840 },
            ]}
          />
        </div>
      </div>

      {/* Modals */}
      <DataTableModal
        open={mrrModalOpen}
        onOpenChange={setMrrModalOpen}
        title="Données MRR"
        columns={[
          { key: "month", label: "Mois" },
          { key: "mrr", label: "MRR", format: (v) => `${(v || 0).toLocaleString()}€` },
        ]}
        data={mrrData}
        variant="pp"
      />
      <DataTableModal
        open={churnModalOpen}
        onOpenChange={setChurnModalOpen}
        title="Données rétention"
        columns={[
          { key: "name", label: "Statut" },
          { key: "value", label: "Pourcentage", format: (v) => `${v}%` },
        ]}
        data={churnData}
        variant="pp"
      />
    </div>
  );
}



