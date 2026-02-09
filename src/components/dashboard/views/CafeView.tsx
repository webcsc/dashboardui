import { useModalState } from '@/hooks/useModalState';
import { useMemo, useState, useEffect } from 'react';
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
  DefaultTooltipContent,
} from 'recharts';
import type { FilterState } from '@/types';
import {
  useOverview,
  useEvolution,
  useDistribution,
  useProducts,
} from '@/hooks/useDashboardData';
import { calculateTrend } from '@/lib/trend-utils';
import { transformDistributionData, transformEvolutionData } from '@/lib/dashboard-utils';
import { DataTableModal } from '../modals/DataTableModal';
import { ProductCategorySection } from '../sections/ProductCategorySection';
import { Switch } from '@/components/ui/switch';
import { formatWeight } from '@/lib';
import { EvolutionData, EvolutionMonthData } from '@/services/dashboard-api';

interface CafeViewProps {
  filters: FilterState;
  isComparing: boolean;
}

const COLORS = ['hsl(25, 60%, 35%)', 'hsl(25, 45%, 50%)', 'hsl(25, 35%, 65%)'];

export function CafeView({ filters, isComparing }: CafeViewProps) {
  // Modal state for client filter
  const [modalClientId, setModalClientId] = useState<string | undefined>();
  const { openModals, openModal, closeModal, isAnyOpen } = useModalState([
    'caTotal',
    'volumeTotal',
    'partB2B',
    'prixMoyen',
    // ... (rest of modals)
    'format',
    'evolution',
  ]);

  // Sync modal client filter with global filter when opening
  useEffect(() => {
    if (isAnyOpen) {
      setModalClientId(filters.clientId);
    }
  }, [isAnyOpen, filters.clientId]);

  // Modal specific filters
  const modalFilters = useMemo(() => ({
    ...filters,
    clientId: modalClientId
  }), [filters, modalClientId]);

  // Fetch data specifically for modals (independent of main view)
  const { data: modalOverviewResponse } = useOverview('cafe', modalFilters, { enabled: isAnyOpen });
  const { data: modalEvolutionResponse } = useEvolution('cafe', modalFilters, { enabled: isAnyOpen });
  const { data: modalDistributionResponse } = useDistribution('cafe', modalFilters, { enabled: isAnyOpen });

  const modalOverview = modalOverviewResponse?.data;

  // Transform modal data
  const modalFormatData = useMemo(() =>
    transformDistributionData(modalDistributionResponse?.distribution),
    [modalDistributionResponse]
  );

  const modalEvolutionData = useMemo(() =>
    transformEvolutionData(
      modalEvolutionResponse?.data,
      filters.period.start.getFullYear().toString(),
      12 // Limit to 12 months
    ),
    [modalEvolutionResponse, filters.period]
  );

  // Fetch API Data
  const { data: overviewResponse } = useOverview('cafe', filters);
  const { data: evolutionResponse } = useEvolution('cafe', filters);
  const { data: distributionResponse } = useDistribution('cafe', filters);
  const { data: productsResponse } = useProducts('cafe', filters);

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

  const { data: compareProductsResponse } = useProducts(
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
  const compareProducts = compareProductsResponse?.products;
  const products = productsResponse?.products;

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
      // .filter((item) => item.part >= 1)
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
  const isMoreAYear = evolution && (Object.entries(evolution)?.length > 2);

  const evolutionData = evolution
    ? Object.entries(evolution).flatMap(([year, yearData]) =>
      Object.entries(yearData).flatMap(([month, monthData]: [string, EvolutionMonthData]) =>
        Object.entries(monthData).flatMap(([_name, data]: [string, EvolutionData]) => {
          return {
            mois: `${month.substring(0, 3)} ${isMoreAYear ? year : ''}`,
            ca: data.ca_total_ht,
            volume: data.volume_total,
            actif: data.actif
          }
        }),
      )
    )
    : [];
  evolutionData?.splice(-3)

  // KPI Values
  const caTotal = Number(overview?.ca_total_ht_global || 0) || 0;
  const volumeTotal = Number(overview?.volume_total_global || 0) || 0;
  const partB2B = Number(overview?.part_b2b || 0) || 0;
  const prixMoyen = Number(overview?.average_price_per_kg || 0) || 0;

  const caTotalPrev = compareOverview?.ca_total_ht_global;
  const volumeTotalPrev = compareOverview?.volume_total_global;
  const partB2BPrev = compareOverview?.part_b2b;
  const prixMoyenPrev = compareOverview?.average_price_per_kg;

  const renderProductView = () => {
    if (!products) return null;

    return Object.entries(products).map(([category, productList]) => {
      // 1. Get current rows
      const currentRows = Array.isArray(productList)
        ? productList
        : Object.values(productList ?? {});

      if (!currentRows.length) return null;

      // 2. Get comparison rows (if any)
      const compareList = compareProducts?.[category];
      const compareRows = Array.isArray(compareList)
        ? compareList
        : Object.values(compareList ?? {});

      // 3. Merge data
      const mergedData = currentRows.map((row: any) => {
        // Find matching row in previous period
        // Usually matching by 'type' or 'marque' or 'reference' depending on the category structure
        // We'll try common keys
        const matchKey = row.type || row.marque || row.reference || row.categorie;

        const prevRow = compareRows.find((p: any) => {
          const pKey = p.type || p.marque || p.reference || p.categorie;
          return pKey === matchKey;
        });

        const currentCA = row.ca_total_ht || 0;
        const prevCA = prevRow?.ca_total_ht;

        const currentVol = row.volume_total || 0;
        const prevVol = prevRow?.volume_total;

        const trendCA = getTrend(currentCA, prevCA);
        const trendVol = getTrend(currentVol, prevVol);

        return {
          ...row,
          prev_ca: prevCA,
          trend_ca: trendCA,
          prev_vol: prevVol,
          trend_vol: trendVol,
        };
      });

      // 4. Define columns based on isComparing
      const columns: any[] = [
        { key: "type", label: "Type", width: "w-[30%]" },
      ];

      // Detect visual key
      const firstRow = currentRows[0];
      let mainKey = "type";
      let mainLabel = "Type";
      if (firstRow.marque) { mainKey = "marque"; mainLabel = "Marque"; }
      else if (firstRow.categorie) { mainKey = "categorie"; mainLabel = "Catégorie"; }
      else if (firstRow.reference) { mainKey = "reference"; mainLabel = "Référence"; }

      columns[0] = { key: mainKey, label: mainLabel, width: isComparing ? "w-[22%]" : "w-[40%]" };


      columns.push({
        key: "ca_total_ht",
        label: "CA",
        format: (v: number) => `${(v / 1000).toFixed(0)}k€`,
        width: isComparing ? "w-[13%]" : "w-[30%]"
      });

      if (isComparing) {
        columns.push({
          key: "prev_ca",
          label: "Préc. (CA)",
          format: (v: number) => v !== undefined ? `${(v / 1000).toFixed(0)}k€` : "-",
          width: "w-[13%]"
        });

        columns.push({
          key: "trend_ca",
          label: "Évol. (CA)",
          format: (v: number) => {
            if (v === undefined || isNaN(v)) return "-";
            const colorClass = v > 0 ? "text-emerald-600" : v < 0 ? "text-red-600" : "text-muted-foreground";
            return <span className={colorClass}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>;
          },
          width: "w-[13%]"
        });
      }

      columns.push({ key: "volume_total", label: "Volume", format: (v: number) => `${Math.round(v)}kg`, width: isComparing ? "w-[13%]" : "w-[30%]" });

      if (isComparing) {
        columns.push({
          key: "prev_vol",
          label: "Préc. (Vol)",
          format: (v: number) => v !== undefined ? `${Math.round(v)}kg` : "-",
          width: "w-[13%]"
        });

        columns.push({
          key: "trend_vol",
          label: "Évol. (Vol)",
          format: (v: number) => {
            if (v === undefined || isNaN(v)) return "-";
            const colorClass = v > 0 ? "text-emerald-600" : v < 0 ? "text-red-600" : "text-muted-foreground";
            return <span className={colorClass}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>;
          },
          width: "w-[13%]"
        });
      }

      return (
        <ProductCategorySection
          key={category}
          title={category}
          icon={<Bean className="h-5 w-5 text-universe-cafe" />}
          columns={columns}
          data={mergedData}
          variant="cafe"
        />
      );
    });
  };

  const renderCustomBarCell = () => {
    return evolutionData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.actif === 1 ? 'hsl(25, 60%, 35%)' : 'hsl(25, 35%, 65%)'} />
    ))
  }
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
              CA
              <Switch
                id="switch-volume"
                name="switch-volume"
                className="data-[state=unchecked]:bg-primary"
                onClick={handleSwitchChange}
              />
              Volume
            </label>
            <span className="text-xs text-muted-foreground underline">
              Voir tableau
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={evolutionData}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
              <XAxis dataKey="mois" stroke="hsl(25, 15%, 45%)" fontSize={12} />
              <YAxis
                stroke="hsl(25, 15%, 45%)"
                fontSize={12}
                tickFormatter={(v) => (switchVolume ? evolutionData.some((i) => i.volume > 1000) ? formatWeight(v, 0) : formatWeight(v) : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(40, 25%, 99%)',
                  border: '1px solid hsl(35, 20%, 88%)',
                  borderRadius: '0.75rem',
                }}
                content={({ payload, ...props }) => {
                  if (!payload || payload.every(p => !p.value || p.value === 0)) return null;
                  return <DefaultTooltipContent payload={payload} {...props} />;
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'CA (€)') {
                    return [`${(value || 0).toLocaleString()}€`, 'CA'];
                  }
                  return [formatWeight(value || 0), 'Volume'];
                }}
              />
              <Legend />
              {switchVolume ? (
                <Bar
                  dataKey="volume"
                  name="Volume"
                  fill="hsl(25, 60%, 35%)"
                  radius={[4, 4, 0, 0]}
                >
                  {renderCustomBarCell()}
                </Bar>
              ) : (
                <Bar
                  dataKey="ca"
                  name="CA (€)"
                  fill="hsl(25, 60%, 35%)"
                  radius={[4, 4, 0, 0]}
                >
                  {renderCustomBarCell()}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {renderProductView()}

      {/* Modals */}
      <DataTableModal
        open={openModals.caTotal || false}
        onOpenChange={() => closeModal('caTotal')}
        title="Répartition CA Café"
        clientId={modalClientId}
        onClientChange={setModalClientId}
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
            ca: (Number(modalOverview?.ca_total_ht_global) || 0) * (1 - (Number(modalOverview?.part_b2b) || 0) / 100),
            part: `${(100 - (Number(modalOverview?.part_b2b) || 0)).toFixed(1)}%`,
          },
          {
            segment: 'B2C / Particuliers',
            ca: (Number(modalOverview?.ca_total_ht_global) || 0) * ((Number(modalOverview?.part_b2b) || 0) / 100),
            part: `${(Number(modalOverview?.part_b2b) || 0).toFixed(1)}%`,
          },
        ]}
        variant="cafe"
      />
      <DataTableModal
        open={openModals.volumeTotal || false}
        onOpenChange={() => closeModal('volumeTotal')}
        title="Répartition Volume"
        clientId={modalClientId}
        onClientChange={setModalClientId}
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
            volume: (Number(modalOverview?.volume_total_global) || 0) * ((Number(modalOverview?.part_b2b) || 0) / 100),
            part: `${(Number(modalOverview?.part_b2b) || 0).toFixed(1)}%`,
          },
          {
            segment: 'B2C / Particuliers',
            volume: (Number(modalOverview?.volume_total_global) || 0) * (1 - (Number(modalOverview?.part_b2b) || 0) / 100),
            part: `${(100 - (Number(modalOverview?.part_b2b) || 0)).toFixed(1)}%`,
          },
        ]}
        variant="cafe"
      />
      <DataTableModal
        open={openModals.partB2B || false}
        onOpenChange={() => closeModal('partB2B')}
        title="Évolution B2B/B2C"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: 'mois', label: 'Mois' },
          { key: 'b2b', label: 'B2B %' },
          { key: 'b2c', label: 'B2C %' },
        ]}
        data={
          evolutionData.length > 0
            ? evolutionData.map((item: any) => {
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
              const val = rawMonth?.part_b2b | 9 | 0;
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
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: 'format', label: 'Format' },
          { key: 'prix', label: 'Prix/kg', format: (v) => `${(Number(v) || 0).toFixed(2)}€` },
        ]}
        data={[
          {
            format: 'Prix Moyen Global',
            prix: modalOverview?.average_price_per_kg || 0,
          },
        ]}
        variant="cafe"
      />
      <DataTableModal
        open={openModals.format || false}
        onOpenChange={() => closeModal('format')}
        title="Répartition par Format"
        clientId={modalClientId}
        onClientChange={setModalClientId}
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
        data={modalFormatData}
        variant="cafe"
      />
      <DataTableModal
        open={openModals.evolution || false}
        onOpenChange={() => closeModal('evolution')}
        title="Évolution Mensuelle Café"
        clientId={modalClientId}
        onClientChange={setModalClientId}
        columns={[
          { key: 'mois', label: 'Mois' },
          {
            key: 'ca',
            label: 'CA',
            format: (v) => `${(v || 0).toLocaleString()}€`,
          },
          { key: 'volume', label: 'Volume (kg)' },
        ]}
        data={modalEvolutionData}
        variant="cafe"
      />
    </div>
  );
}
