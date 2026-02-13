import { useState } from "react";
import { SimpleKpiCard } from "../cards/SimpleKpiCard";
import { BaseKpiCard } from "../cards/BaseKpiCard";
import {
  User,
  Coffee,
  TrendingUp,
  Euro,
  Target,
  Star,
  Share2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { FilterState } from "@/types";
import { DataTableModal } from "../modals/DataTableModal";

interface B2CViewProps {
  filters: FilterState;
  isComparing: boolean;
}

const mrrData = [
  { month: "Jan", mrr: 18500 },
  { month: "Fév", mrr: 21000 },
  { month: "Mar", mrr: 23500 },
  { month: "Avr", mrr: 25000 },
  { month: "Mai", mrr: 27500 },
  { month: "Juin", mrr: 29000 },
];

const retentionData = [
  { month: "M1", retention: 100 },
  { month: "M2", retention: 92 },
  { month: "M3", retention: 85 },
  { month: "M4", retention: 80 },
  { month: "M5", retention: 76 },
  { month: "M6", retention: 73 },
];

// Table data
const mrrB2CTableData = [
  { mois: "Janvier", mrr: 18500, abonnes: 412, panier: 45 },
  { mois: "Février", mrr: 21000, abonnes: 468, panier: 45 },
  { mois: "Mars", mrr: 23500, abonnes: 525, panier: 45 },
  { mois: "Avril", mrr: 25000, abonnes: 580, panier: 43 },
  { mois: "Mai", mrr: 27500, abonnes: 642, panier: 43 },
  { mois: "Juin", mrr: 29000, abonnes: 690, panier: 42 },
];

const retentionTableData = [
  { mois: "M1", cohorte: 500, restants: 500, taux: "100%" },
  { mois: "M2", cohorte: 500, restants: 460, taux: "92%" },
  { mois: "M3", cohorte: 500, restants: 425, taux: "85%" },
  { mois: "M4", cohorte: 500, restants: 400, taux: "80%" },
  { mois: "M5", cohorte: 500, restants: 380, taux: "76%" },
  { mois: "M6", cohorte: 500, restants: 365, taux: "73%" },
];

const ltvTableData = [
  { segment: "Nouveaux (<3m)", cac: 32, ltv: 98, ratio: "1:3.1" },
  { segment: "Établis (3-12m)", cac: 28, ltv: 125, ratio: "1:4.5" },
  { segment: "Fidèles (>12m)", cac: 22, ltv: 185, ratio: "1:8.4" },
  { segment: "Moyenne", cac: 28, ltv: 118, ratio: "1:4.2" },
];

const npsTableData = [
  { categorie: "Promoteurs (9-10)", nombre: 485, part: "45%" },
  { categorie: "Passifs (7-8)", nombre: 387, part: "36%" },
  { categorie: "Détracteurs (0-6)", nombre: 204, part: "19%" },
  { categorie: "NPS Score", nombre: 62, part: "45-19=26pts" },
];

const ococB2CData = [
  { mois: "Janvier", abonnes: 412, ococ: 1730, arbres: 395 },
  { mois: "Février", abonnes: 468, ococ: 1965, arbres: 449 },
  { mois: "Mars", abonnes: 525, ococ: 2205, arbres: 504 },
  { mois: "Avril", abonnes: 580, ococ: 2436, arbres: 557 },
  { mois: "Mai", abonnes: 642, ococ: 2696, arbres: 616 },
  { mois: "Juin", abonnes: 690, ococ: 2898, arbres: 662 },
];

export function B2CView({ filters, isComparing }: B2CViewProps) {
  const [mrrModalOpen, setMrrModalOpen] = useState(false);
  const [retentionModalOpen, setRetentionModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs prioritaires */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <User className="h-6 w-6 text-segment-b2c" />
          B2C Abonnements – KPIs Clés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <BaseKpiCard
            label="MRR abonnements"
            value="29k€"
            previousValue="26k€"
            trend={5.5}
            icon={<Euro className="h-5 w-5 text-segment-b2c" />}
            variant="b2c"
            showComparison={isComparing}
            tableTitle="Évolution MRR B2C"
            tableColumns={[
              { key: "mois", label: "Mois" },
              {
                key: "mrr",
                label: "MRR",
                format: (v) => `${(v || 0).toLocaleString()}€`,
              },
              { key: "abonnes", label: "Abonnés" },
              { key: "panier", label: "Panier moy.", format: (v) => `${v}€` },
            ]}
            tableData={mrrB2CTableData}
          />
          <BaseKpiCard
            label="Rétention 6 mois"
            value="73%"
            previousValue="70%"
            trend={2.8}
            icon={<TrendingUp className="h-5 w-5 text-segment-b2c" />}
            variant="b2c"
            showComparison={isComparing}
            tableTitle="Courbe de rétention"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "cohorte", label: "Cohorte initiale" },
              { key: "restants", label: "Restants" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={retentionTableData}
          />
          <BaseKpiCard
            label="CAC vs LTV"
            value="1:4.2"
            previousValue="1:3.8"
            trend={8.3}
            icon={<Target className="h-5 w-5 text-segment-b2c" />}
            variant="b2c"
            showComparison={isComparing}
            tableTitle="CAC/LTV par segment"
            tableColumns={[
              { key: "segment", label: "Segment" },
              { key: "cac", label: "CAC", format: (v) => `${v}€` },
              { key: "ltv", label: "LTV", format: (v) => `${v}€` },
              { key: "ratio", label: "Ratio" },
            ]}
            tableData={ltvTableData}
          />
          <BaseKpiCard
            label="NPS"
            value="62"
            previousValue="58"
            trend={5}
            icon={<Star className="h-5 w-5 text-segment-b2c" />}
            variant="b2c"
            showComparison={isComparing}
            tableTitle="Détail NPS"
            tableColumns={[
              { key: "categorie", label: "Catégorie" },
              { key: "nombre", label: "Répondants" },
              { key: "part", label: "Part" },
            ]}
            tableData={npsTableData}
          />
          <BaseKpiCard
            label="€ OCOC / abonné"
            value="4.20€"
            previousValue="3.75€"
            trend={12.1}
            icon={<User className="h-5 w-5 text-segment-b2c" />}
            variant="b2c"
            showComparison={isComparing}
            tableTitle="Impact OCOC B2C"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "abonnes", label: "Abonnés" },
              { key: "ococ", label: "€ OCOC", format: (v) => `${v}€` },
              { key: "arbres", label: "Arbres" },
            ]}
            tableData={ococB2CData}
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
            <h3 className="text-lg font-semibold">Évolution MRR Abonnements</h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mrrData}>
              <defs>
                <linearGradient id="colorMrrB2c" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(145, 45%, 35%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(145, 45%, 35%)"
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
                  `${((value || 0) / 1000).toFixed(0)}k€`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [
                  `${(value || 0).toLocaleString()}€`,
                  "MRR",
                ]}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="hsl(145, 45%, 35%)"
                fillOpacity={1}
                fill="url(#colorMrrB2c)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setRetentionModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Courbe de rétention</h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(40, 25%, 99%)",
                  border: "1px solid hsl(35, 20%, 88%)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value: number) => [`${value}%`, "Rétention"]}
              />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="hsl(145, 45%, 35%)"
                strokeWidth={3}
                dot={{ fill: "hsl(145, 45%, 35%)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPIs secondaires */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Acquisition & Engagement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SimpleKpiCard
            label="Abonnés actifs"
            value="1,247"
            trend={11.2}
            icon={<User className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Répartition abonnés"
            tableColumns={[
              { key: "formule", label: "Formule" },
              { key: "abonnes", label: "Abonnés" },
              { key: "part", label: "Part" },
            ]}
            tableData={[
              { formule: "Découverte", abonnes: 312, part: "25%" },
              { formule: "Classique", abonnes: 623, part: "50%" },
              { formule: "Premium", abonnes: 312, part: "25%" },
            ]}
          />
          <SimpleKpiCard
            label="CAC"
            value="28€"
            trend={-8.5}
            trendLabel="réduction"
            icon={<Euro className="h-4 w-4 text-muted-foreground" />}
            tableTitle="CAC par canal"
            tableColumns={[
              { key: "canal", label: "Canal" },
              { key: "acquisitions", label: "Acquisitions" },
              { key: "cac", label: "CAC", format: (v) => `${v}€` },
            ]}
            tableData={[
              { canal: "SEO/Organique", acquisitions: 145, cac: 12 },
              { canal: "Social Ads", acquisitions: 89, cac: 35 },
              { canal: "Parrainage", acquisitions: 67, cac: 18 },
              { canal: "Google Ads", acquisitions: 52, cac: 42 },
            ]}
          />
          <SimpleKpiCard
            label="Panier moyen"
            value="42€"
            trend={3.2}
            icon={<Coffee className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Panier par formule"
            tableColumns={[
              { key: "formule", label: "Formule" },
              { key: "panier", label: "Panier moy.", format: (v) => `${v}€` },
              { key: "frequence", label: "Fréquence" },
            ]}
            tableData={[
              { formule: "Découverte", panier: 28, frequence: "Mensuel" },
              { formule: "Classique", panier: 42, frequence: "Mensuel" },
              { formule: "Premium", panier: 65, frequence: "Bi-mensuel" },
            ]}
          />
          <SimpleKpiCard
            label="Taux parrainage"
            value="18%"
            trend={24}
            icon={<Share2 className="h-4 w-4 text-muted-foreground" />}
            tableTitle="Programme parrainage"
            tableColumns={[
              { key: "mois", label: "Mois" },
              { key: "parrains", label: "Parrains" },
              { key: "filleuls", label: "Filleuls" },
              { key: "taux", label: "Taux" },
            ]}
            tableData={[
              { mois: "Avril", parrains: 85, filleuls: 12, taux: "14%" },
              { mois: "Mai", parrains: 102, filleuls: 18, taux: "18%" },
              { mois: "Juin", parrains: 118, filleuls: 21, taux: "18%" },
            ]}
          />
        </div>
      </div>

      {/* Modals */}
      <DataTableModal
        open={mrrModalOpen}
        onOpenChange={setMrrModalOpen}
        title="Données MRR Abonnements"
        columns={[
          { key: "month", label: "Mois" },
          {
            key: "mrr",
            label: "MRR",
            format: (v) => `${(v || 0).toLocaleString()}€`,
          },
        ]}
        data={mrrData}
        variant="b2c"
      />
      <DataTableModal
        open={retentionModalOpen}
        onOpenChange={setRetentionModalOpen}
        title="Courbe de rétention"
        columns={[
          { key: "month", label: "Mois" },
          { key: "retention", label: "Taux", format: (v) => `${v}%` },
        ]}
        data={retentionData}
        variant="b2c"
      />
    </div>
  );
}
