import { useModalState } from '@/hooks/useModalState';
import { useMemo, useState } from 'react';
import { BaseKpiCard } from '../cards/BaseKpiCard';
import { Coffee, Bean, Package, Droplets } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { FilterState } from '@/types';
import {
  useOverview,
  useEvolution,
  useDistribution,
} from '@/hooks/useDashboardData';
import { calculateTrend } from '@/lib/trend-utils';
import { DataTableModal } from '../modals/DataTableModal';
import { ProductCategorySection } from '../sections/ProductCategorySection';
import { Switch } from '@/components/ui/switch';

interface CafeViewProps {
  filters: FilterState;
  isComparing: boolean;
}

const COLORS = ['hsl(25, 60%, 35%)', 'hsl(25, 45%, 50%)', 'hsl(25, 35%, 65%)'];

// Café en grains - M2L
const cafeGrainsM2LData = [
  { type: 'Angelico', ca: 45000, volume: 1200, part: '18%' },
  { type: 'Moderato', ca: 38000, volume: 980, part: '15%' },
  { type: 'Dona', ca: 32000, volume: 850, part: '13%' },
  { type: 'Intenso', ca: 28000, volume: 720, part: '11%' },
  { type: 'Perou', ca: 22000, volume: 580, part: '9%' },
  { type: 'Autres M2L', ca: 18000, volume: 470, part: '7%' },
];

const cafeGrainsItalienData = [
  { marque: 'Lavazza', ca: 35000, volume: 920, part: '14%' },
  { marque: 'Illy', ca: 22000, volume: 580, part: '9%' },
  { marque: 'Autres Italien', ca: 12000, volume: 300, part: '5%' },
];

// Café moulu
const cafeMouluData = [
  { type: 'M2L Moulu', ca: 28000, volume: 750, part: '45%' },
  { type: 'Italien Moulu', ca: 18000, volume: 480, part: '29%' },
  { type: 'Autres Moulu', ca: 16000, volume: 420, part: '26%' },
];

// Café dosette
const cafeDosetteData = [
  { type: 'M2L Dosettes', ca: 42000, volume: 1100, part: '65%' },
  { type: 'Autres Dosettes', ca: 22000, volume: 580, part: '35%' },
];

// Thé
const theData = [
  { marque: 'Pagès', ca: 28000, volume: 720, part: '35%' },
  { marque: 'Palmarès', ca: 22000, volume: 560, part: '28%' },
  { marque: 'Kusmi Tea', ca: 18000, volume: 450, part: '23%' },
  { marque: 'Autres', ca: 12000, volume: 320, part: '15%' },
];

// Divers
const diversData = [
  { categorie: 'Sucre', ca: 15000, volume: 2800, part: '30%' },
  { categorie: 'Chocolat', ca: 18000, volume: 850, part: '36%' },
  { categorie: 'Gobelet', ca: 8000, volume: 12000, part: '16%' },
  { categorie: 'Agitateur', ca: 4000, volume: 8500, part: '8%' },
  { categorie: 'Divers', ca: 5000, volume: 1200, part: '10%' },
];

// Évolution mensuelle
const evolutionMensuelleData = [
  { mois: 'Jan', ca: 72000, volume: 1850 },
  { mois: 'Fév', ca: 78000, volume: 2020 },
  { mois: 'Mar', ca: 82000, volume: 2150 },
  { mois: 'Avr', ca: 79000, volume: 2050 },
  { mois: 'Mai', ca: 85000, volume: 2210 },
  { mois: 'Juin', ca: 89000, volume: 2320 },
];

export function CafeView({ filters, isComparing }: CafeViewProps) {
  const { openModals, openModal, closeModal } = useModalState([
    'caTotal',
    'volumeTotal',
    'partB2B',
    'prixMoyen',
    'format',
    'evolution',
  ]);
  // Fetch API Data
  const { data: overviewResponse } = useOverview('cafe', filters);
  const { data: evolutionResponse } = useEvolution('cafe', filters);
  const { data: distributionResponse } = useDistribution('cafe', filters);

  const [switchVolume, setSwitchVolume] = useState(false);
  const handleSwitchChange = () => {
    setSwitchVolume((e) => !e);
  };
  const comparisonFilters = useMemo(
    () => ({
      ...filters,
      period: filters.comparePeriod || filters.period,
    }),
    [filters],
  );

  const { data: compareOverviewResponse } = useOverview(
    'cafe',
    comparisonFilters,
    {
      enabled: isComparing && !!filters.comparePeriod,
    },
  );

  const overview = overviewResponse?.data;
  const compareOverview = compareOverviewResponse?.data;
  const evolution = evolutionResponse?.data;
  const distribution = distributionResponse?.distribution;

  // Transform Distribution Data
  const formatData = useMemo(() => {
    if (!distribution) return [];
    return Object.entries(distribution)
      .map(([key, item]: [string, any]) => ({
        name: item.poid_unit
          ? item.poid_unit >= 1
            ? `${item.poid_unit} kg`
            : `${(parseFloat(item.poid_unit) * 1000).toFixed(0)} g`
          : key,
        ca: item.ca_total_ht,
        volume: item.poids_total,
        part: parseFloat(item.percentage_kg) || 0,
      }))
      .sort((a, b) => b.part - a.part);
  }, [distribution]);

  // Helper to calculate trend
  const getTrend = (current?: number, previous?: number) => {
    if (!isComparing || previous === undefined || previous === 0)
      return undefined;
    return calculateTrend(current || 0, previous || 0).value;
  };

  const getPreviousValue = (value?: number, suffix: string = '') => {
    if (!isComparing || value === undefined) return '-';
    return `${value}${suffix}`;
  };

  const getPreviousCurrencyValue = (value?: number) => {
    if (!isComparing || value === undefined) return '-';
    return `${(value / 1000).toFixed(1)}k€`;
  };

  // Transform Evolution Data for Chart
  const currentYear = filters.period.start.getFullYear().toString();
  const evolutionData = evolution?.[currentYear]
    ? Object.entries(evolution[currentYear]).map(
        ([month, data]: [string, any]) => ({
          mois: month.substring(0, 3), // "January" -> "Jan"
          ca: data.ca_total_ht,
          volume: data.volume_total,
        }),
      )
    : [];

  // KPI Values
  const caTotal = Number(overview?.ca_total_ht_global || 0) || 0;
  const volumeTotal = Number(overview?.volume_total_global || 0) || 0;
  const partB2B = Number(overview?.part_b2b || 0) || 0;
  const prixMoyen = Number(overview?.average_price_per_kg || 0) || 0;

  const caTotalPrev = compareOverview?.ca_total_ht_global;
  const volumeTotalPrev = compareOverview?.volume_total_global;
  const partB2BPrev = compareOverview?.part_b2b;
  const prixMoyenPrev = compareOverview?.average_price_per_kg;

  // Filtrage des données locales pour la recherche
  const searchLower = filters.searchProduct?.toLowerCase() || '';

  const filteredCafeGrainsM2L = useMemo(
    () =>
      cafeGrainsM2LData.filter((item) =>
        item.type.toLowerCase().includes(searchLower),
      ),
    [searchLower],
  );

  const filteredCafeGrainsItalien = useMemo(
    () =>
      cafeGrainsItalienData.filter((item) =>
        item.marque.toLowerCase().includes(searchLower),
      ),
    [searchLower],
  );

  const filteredCafeMoulu = useMemo(
    () =>
      cafeMouluData.filter((item) =>
        item.type.toLowerCase().includes(searchLower),
      ),
    [searchLower],
  );

  const filteredCafeDosette = useMemo(
    () =>
      cafeDosetteData.filter((item) =>
        item.type.toLowerCase().includes(searchLower),
      ),
    [searchLower],
  );

  const filteredThe = useMemo(
    () =>
      theData.filter((item) => item.marque.toLowerCase().includes(searchLower)),
    [searchLower],
  );

  const filteredDivers = useMemo(
    () =>
      diversData.filter((item) =>
        item.categorie.toLowerCase().includes(searchLower),
      ),
    [searchLower],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs globaux */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Coffee className="h-6 w-6 text-universe-cafe" />
          Univers Café – Vue d'ensemble
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BaseKpiCard
            label="CA Total Café"
            value={`${(caTotal / 1000).toFixed(1)}k€`}
            previousValue={getPreviousCurrencyValue(caTotalPrev)}
            trend={getTrend(caTotal, caTotalPrev)}
            icon={<Coffee className="h-5 w-5 text-universe-cafe" />}
            showComparison={isComparing}
            onClick={() => openModal('caTotal')}
          />
          <BaseKpiCard
            label="Volume Total"
            value={`${(volumeTotal / 1000).toFixed(1)}t`}
            previousValue={
              isComparing && volumeTotalPrev !== undefined
                ? `${(volumeTotalPrev / 1000).toFixed(1)}t`
                : '-'
            }
            trend={getTrend(volumeTotal, volumeTotalPrev)}
            icon={<Package className="h-5 w-5 text-universe-cafe" />}
            showComparison={isComparing}
            onClick={() => openModal('volumeTotal')}
          />
          <BaseKpiCard
            label="Part B2B"
            value={`${partB2B}%`}
            previousValue={getPreviousValue(partB2BPrev, '%')}
            trend={getTrend(partB2B, partB2BPrev)}
            icon={<Bean className="h-5 w-5 text-universe-cafe" />}
            showComparison={isComparing}
            onClick={() => openModal('partB2B')}
          />
          <BaseKpiCard
            label="Prix moyen / kg"
            value={`${(prixMoyen || 0).toFixed(2)}€`}
            previousValue={
              isComparing && typeof prixMoyenPrev === 'number'
                ? `${prixMoyenPrev.toFixed(2)}€`
                : '-'
            }
            trend={getTrend(prixMoyen, prixMoyenPrev)}
            icon={<Droplets className="h-5 w-5 text-universe-cafe" />}
            showComparison={isComparing}
            onClick={() => openModal('prixMoyen')}
          />
        </div>
      </div>

      {/* Graphiques répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="chart-container cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openModal('format')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Répartition par Format</h3>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={formatData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, part }) => `${name} : ${part}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="part"
              >
                {formatData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(40, 25%, 99%)',
                  border: '1px solid hsl(35, 20%, 88%)',
                  borderRadius: '0.75rem',
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
            <h3 className="text-lg font-semibold">Évolution Mensuelle</h3>
            <label
              htmlFor="switch-volume"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              Afficher le volume au lieu du CA
              <Switch
                id="switch-volume"
                name="switch-volume"
                onClick={handleSwitchChange}
              />
            </label>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={
                evolutionData.length > 0
                  ? evolutionData
                  : evolutionMensuelleData
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="mois" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(40, 25%, 99%)',
                  border: '1px solid hsl(35, 20%, 88%)',
                  borderRadius: '0.75rem',
                }}
                formatter={(value: number, name: string) => [
                  name === 'CA (€)'
                    ? `${(value || 0).toLocaleString()}€`
                    : `${value || 0} kg`,
                  name === 'CA (€)' ? 'CA' : 'Volume',
                ]}
              />
              <Legend />
              {switchVolume ? (
                <Bar
                  dataKey="volume"
                  name="Volume (kg)"
                  fill="hsl(25, 60%, 35%)"
                  radius={[4, 4, 0, 0]}
                />
              ) : (
                <Bar
                  dataKey="ca"
                  name="CA (€)"
                  fill="hsl(25, 60%, 35%)"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sections détaillées par catégorie */}
      <ProductCategorySection
        title="Café en Grains – M2L"
        icon={<Bean className="h-5 w-5 text-universe-cafe" />}
        columns={[
          { key: 'type', label: 'Type' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v / 1000).toFixed(0)}k€`,
          },
          { key: 'volume', label: 'Volume (kg)' },
          { key: 'part', label: 'Part' },
        ]}
        data={filteredCafeGrainsM2L}
        variant="cafe"
      />

      <ProductCategorySection
        title="Café en Grains – Italien"
        icon={<Bean className="h-5 w-5 text-universe-cafe" />}
        columns={[
          { key: 'marque', label: 'Marque' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v / 1000).toFixed(0)}k€`,
          },
          { key: 'volume', label: 'Volume (kg)' },
          { key: 'part', label: 'Part' },
        ]}
        data={filteredCafeGrainsItalien}
        variant="cafe"
      />

      <ProductCategorySection
        title="Café Moulu"
        icon={<Coffee className="h-5 w-5 text-universe-cafe" />}
        columns={[
          { key: 'type', label: 'Type' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v / 1000).toFixed(0)}k€`,
          },
          { key: 'volume', label: 'Volume (kg)' },
          { key: 'part', label: 'Part' },
        ]}
        data={filteredCafeMoulu}
        variant="cafe"
      />

      <ProductCategorySection
        title="Café Dosettes"
        icon={<Package className="h-5 w-5 text-universe-cafe" />}
        columns={[
          { key: 'type', label: 'Type' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v / 1000).toFixed(0)}k€`,
          },
          { key: 'volume', label: 'Volume' },
          { key: 'part', label: 'Part' },
        ]}
        data={filteredCafeDosette}
        variant="cafe"
      />

      <ProductCategorySection
        title="Thé"
        icon={<Droplets className="h-5 w-5 text-universe-cafe" />}
        columns={[
          { key: 'marque', label: 'Marque' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v / 1000).toFixed(0)}k€`,
          },
          { key: 'volume', label: 'Volume (g)' },
          { key: 'part', label: 'Part' },
        ]}
        data={filteredThe}
        variant="cafe"
      />

      <ProductCategorySection
        title="Divers (Sucre, Chocolat, Gobelets...)"
        icon={<Package className="h-5 w-5 text-universe-cafe" />}
        columns={[
          { key: 'categorie', label: 'Catégorie' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v / 1000).toFixed(0)}k€`,
          },
          { key: 'volume', label: 'Volume' },
          { key: 'part', label: 'Part' },
        ]}
        data={filteredDivers}
        variant="cafe"
      />

      {/* Modals */}
      <DataTableModal
        open={openModals.caTotal || false}
        onOpenChange={() => closeModal('caTotal')}
        title="Répartition CA Café"
        columns={[
          { key: 'segment', label: 'Segment' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v / 1000).toFixed(1)}k€`,
          },
          { key: 'part', label: 'Part' },
        ]}
        data={[
          {
            segment: 'B2B',
            ca: caTotal * (partB2B / 100),
            part: `${partB2B.toFixed(1)}%`,
          },
          {
            segment: 'B2C / Particuliers',
            ca: caTotal * (1 - partB2B / 100),
            part: `${(100 - partB2B).toFixed(1)}%`,
          },
        ]}
        variant="cafe"
      />
      <DataTableModal
        open={openModals.volumeTotal || false}
        onOpenChange={() => closeModal('volumeTotal')}
        title="Répartition Volume"
        columns={[
          { key: 'segment', label: 'Segment' },
          {
            key: 'volume',
            label: 'Volume (kg)',
            format: (v) => (v || 0).toFixed(0),
          },
          { key: 'part', label: 'Part' },
        ]}
        data={[
          {
            segment: 'B2B',
            volume: volumeTotal * (partB2B / 100),
            part: `${partB2B.toFixed(1)}%`,
          },
          {
            segment: 'B2C / Particuliers',
            volume: volumeTotal * (1 - partB2B / 100),
            part: `${(100 - partB2B).toFixed(1)}%`,
          },
        ]}
        variant="cafe"
      />
      <DataTableModal
        open={openModals.partB2B || false}
        onOpenChange={() => closeModal('partB2B')}
        title="Évolution B2B/B2C"
        columns={[
          { key: 'mois', label: 'Mois' },
          { key: 'b2b', label: 'B2B %' },
          { key: 'b2c', label: 'B2C %' },
        ]}
        data={
          evolutionData.length > 0
            ? evolutionData.map((item: any) => {
                // Try to find the month data in the raw evolution object to get part_b2b if not in evolutionData
                // evolutionData items are { mois, ca, volume } constructed above.
                // We need to reconstruct or look up in 'evolution' object.
                // Accessing 'evolution' directly is safer.
                const monthKey = Object.keys(
                  evolution?.[currentYear] || {},
                ).find(
                  (k) =>
                    k.startsWith(item.mois) ||
                    item.mois.startsWith(k.substring(0, 3)),
                );
                const rawMonth = monthKey
                  ? evolution[currentYear][monthKey]
                  : null;
                const val = rawMonth?.part_b2b || 0;
                return {
                  mois: item.mois,
                  b2b: `${(val || 0).toFixed(1)}%`,
                  b2c: `${(100 - (val || 0)).toFixed(1)}%`,
                };
              })
            : [
                { mois: 'Jan', b2b: '64%', b2c: '36%' },
                { mois: 'Fév', b2b: '65%', b2c: '35%' },
                { mois: 'Mar', b2b: '66%', b2c: '34%' },
                { mois: 'Avr', b2b: '66%', b2c: '34%' },
                { mois: 'Mai', b2b: '67%', b2c: '33%' },
                { mois: 'Juin', b2b: '66%', b2c: '34%' },
              ]
        }
        variant="cafe"
      />
      <DataTableModal
        open={openModals.prixMoyen || false}
        onOpenChange={() => closeModal('prixMoyen')}
        title="Prix moyen par format"
        columns={[
          { key: 'format', label: 'Format' },
          { key: 'prix', label: 'Prix/kg', format: (v) => `${v}€` },
        ]}
        data={[
          { format: '1kg', prix: 36.03 },
          { format: '500g', prix: 37.37 },
          { format: '250g', prix: 51.58 },
        ]}
        variant="cafe"
      />
      <DataTableModal
        open={openModals.format || false}
        onOpenChange={() => closeModal('format')}
        title="Répartition par Format"
        columns={[
          { key: 'name', label: 'Format' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v / 1000).toFixed(0)}k€`,
          },
          { key: 'volume', label: 'Volume (kg)' },
          { key: 'part', label: 'Part', format: (v) => `${v}%` },
        ]}
        data={formatData}
        variant="cafe"
      />
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal('evolution')}
        title="Évolution Mensuelle Café"
        columns={[
          { key: 'mois', label: 'Mois' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v || 0).toLocaleString()}€`,
          },
          { key: 'volume', label: 'Volume (kg)' },
        ]}
        data={evolutionData.length > 0 ? evolutionData : evolutionMensuelleData}
        variant="cafe"
      />
    </div>
  );
}
