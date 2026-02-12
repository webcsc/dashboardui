import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ArrowLeftRight,
  X,
} from 'lucide-react';

import { getPeriodDates, getComparePeriodDates } from '@/lib/date-utils';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClientComboBox } from '@/components/ui/client-combobox';
import { fetchThirdparties, Thirdparty } from '@/services/dashboard-api';

import type { FilterState } from '@/types';

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  showComparison?: boolean;
}

const PRESET_PERIODS = [
  { label: 'Ce mois', value: 'current-month' },
  { label: 'Mois dernier', value: 'last-month' },
  { label: 'Ce trimestre', value: 'current-quarter' },
  { label: 'Trimestre dernier', value: 'last-quarter' },
  { label: 'Cette année', value: 'current-year' },
  { label: 'Année dernière', value: 'last-year' },
  { label: 'Personnalisé', value: 'custom' },
];

const SEGMENTS = [
  { label: 'Grands Comptes', value: 'gc' },
  { label: 'Plug & Play', value: 'pp' },
  { label: 'B2C', value: 'b2c' },
];

const REGIONS = [
  { label: 'Île-de-France', value: 'idf' },
  { label: 'Auvergne-Rhône-Alpes', value: 'ara' },
  { label: 'PACA', value: 'paca' },
  { label: 'Occitanie', value: 'occitanie' },
  { label: 'Nouvelle-Aquitaine', value: 'na' },
  { label: 'Grand Est', value: 'ge' },
];

const CLIENT_TYPES = [
  { label: 'Entreprises', value: 'entreprise' },
  { label: 'Administrations', value: 'admin' },
  { label: 'Coworking', value: 'coworking' },
  { label: 'Particuliers', value: 'particulier' },
];



export function FilterBar({
  filters,
  onFiltersChange,
  showComparison = true,
}: FilterBarProps) {
  const [selectedPreset, setSelectedPreset] = useState('current-month');
  const [isComparing, setIsComparing] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [clients, setClients] = useState<Thirdparty[]>([]);

  // Load clients for display
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchThirdparties();
        setClients(data);
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    };
    loadClients();
  }, []);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const newPeriod = getPeriodDates(preset);
      onFiltersChange({
        ...filters,
        period: newPeriod,
        comparePeriod: isComparing ? getComparePeriodDates(newPeriod) : undefined,
      });
    } else {
      // For custom period, switch to custom but don't overwrite an existing comparePeriod
      // so the compare range remains editable when `isComparing`.
      const newPeriod = filters.period;
      onFiltersChange({ ...filters, period: newPeriod });
    }
  };

  const toggleComparison = () => {
    const newComparing = !isComparing;
    setIsComparing(newComparing);
    onFiltersChange({
      ...filters,
      comparePeriod: newComparing
        ? getComparePeriodDates(filters.period)
        : undefined,
    });
  };

  // const handleSegmentToggle = (segment: string) => {
  //   const newSegments = filters.segments.includes(segment)
  //     ? filters.segments.filter((s) => s !== segment)
  //     : [...filters.segments, segment];
  //   onFiltersChange({ ...filters, segments: newSegments });
  // };

  // const handleRegionToggle = (region: string) => {
  //   const newRegions = filters.regions.includes(region)
  //     ? filters.regions.filter((r) => r !== region)
  //     : [...filters.regions, region];
  //   onFiltersChange({ ...filters, regions: newRegions });
  // };

  const handleClientTypeToggle = (type: string) => {
    const newTypes = filters.clientTypes.includes(type)
      ? filters.clientTypes.filter((t) => t !== type)
      : [...filters.clientTypes, type];
    onFiltersChange({ ...filters, clientTypes: newTypes });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      period: getPeriodDates('current-month'),
      comparePeriod: undefined,
      segments: [],
      regions: [],
      clientTypes: [],
      clientId: undefined,
    });
    setIsComparing(false);
    setSelectedPreset('current-month');
  };

  const activeFilterCount =
    filters.segments.length +
    filters.regions.length +
    filters.clientTypes.length +
    (filters.clientId ? 1 : 0) +
    (isComparing ? 1 : 0);

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      {/* Primary Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period Preset */}
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[180px]">
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Période" />
            <span className="sr-only">Période</span>
          </SelectTrigger>
          <SelectContent>
            {PRESET_PERIODS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Date Range */}
        <DateRangePicker
          value={filters.period}
          onChange={(newPeriod) => {
            const shouldSetDefaultCompare = isComparing && !filters.comparePeriod;
            onFiltersChange({
              ...filters,
              period: newPeriod,
              comparePeriod: shouldSetDefaultCompare
                ? getComparePeriodDates(newPeriod)
                : filters.comparePeriod,
            });
          }}
          disabled={selectedPreset !== 'custom'}
          label="Sélectionner une période"
        />

        {/* Comparison Toggle */}
        {showComparison && (
          <Button
            variant={isComparing ? 'default' : 'outline'}
            size="sm"
            onClick={toggleComparison}
            className="gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Comparer
          </Button>
        )}

        {/* Allow editing compare period when comparing and using custom period */}
        {isComparing && filters.comparePeriod && (
          <DateRangePicker
            value={filters.comparePeriod}
            onChange={(newComparePeriod) => {
              onFiltersChange({ ...filters, comparePeriod: newComparePeriod });
            }}
            disabled={selectedPreset !== 'custom'}
            label="Période de comparaison"
          />
        )}

        <div className="flex-1" />

        {/* Client Search */}
        <div className="relative">
          <ClientComboBox
            value={filters.clientId}
            onChange={(value) =>
              onFiltersChange({ ...filters, clientId: value })
            }
          />
        </div>

        {/* More Filters Toggle */}
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              showMoreFilters && 'rotate-180',
            )}
          />
        </Button> */}

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Selected Clients Display Bar */}
      {filters.clientId && (() => {
        const selectedIds = filters.clientId.split(',').filter(id => id);
        if (selectedIds.length === 0) return null;

        return (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {selectedIds.map((clientId) => {
              const client = clients.find(c => c.id === clientId);
              if (!client) return null;

              return (
                <Badge
                  key={clientId}
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 text-sm gap-1.5 hover:bg-secondary/80 transition-colors"
                >
                  <span>{client.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIds = selectedIds.filter(id => id !== clientId);
                      onFiltersChange({
                        ...filters,
                        clientId: newIds.length > 0 ? newIds.join(',') : undefined
                      });
                    }}
                    className="ml-1 rounded-sm hover:bg-muted p-0.5 transition-colors"
                    aria-label={`Retirer ${client.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        );
      })()}

      {/* Extended Filters */}
      {showMoreFilters && (
        <div className="space-y-4 pt-4 border-t border-border animate-fade-in">
          {/* Client Types */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Types de clients
            </label>
            <div className="flex flex-wrap gap-2">
              {CLIENT_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={
                    filters.clientTypes.includes(type.value)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleClientTypeToggle(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



