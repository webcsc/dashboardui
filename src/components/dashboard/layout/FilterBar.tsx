import { useState } from 'react';
import {
  CalendarIcon,
  ChevronDown,
  ArrowLeftRight,
  Filter,
  X,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getPeriodDates, getComparePeriodDates } from '@/lib/date-utils';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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

  const handleSegmentToggle = (segment: string) => {
    const newSegments = filters.segments.includes(segment)
      ? filters.segments.filter((s) => s !== segment)
      : [...filters.segments, segment];
    onFiltersChange({ ...filters, segments: newSegments });
  };

  const handleRegionToggle = (region: string) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    onFiltersChange({ ...filters, regions: newRegions });
  };

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
      searchProduct: '',
    });
    setIsComparing(false);
    setSelectedPreset('current-month');
  };

  const activeFilterCount =
    filters.segments.length +
    filters.regions.length +
    filters.clientTypes.length +
    (filters.searchProduct ? 1 : 0) +
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
        {/* Date Display */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal disabled:opacity-80"
              disabled={selectedPreset !== 'custom'}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(filters.period.start, 'dd MMM', { locale: fr })} -{' '}
              {format(filters.period.end, 'dd MMM yyyy', { locale: fr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.period.start,
                to: filters.period.end,
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  const newPeriod = { start: range.from, end: range.to };
                  // When using a custom period, do not forcibly overwrite an existing
                  // comparePeriod so the user can edit the compare range separately.
                  const shouldSetDefaultCompare = isComparing && !filters.comparePeriod;
                  onFiltersChange({
                    ...filters,
                    period: newPeriod,
                    comparePeriod: shouldSetDefaultCompare
                      ? getComparePeriodDates(newPeriod)
                      : filters.comparePeriod,
                  });
                }
              }}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal disabled:opacity-80"
                disabled={selectedPreset !== 'custom'}
              >
                <CalendarIcon className="h-4 w-4" />
                {filters.comparePeriod
                  ? `${format(filters.comparePeriod.start, 'dd MMM', { locale: fr })} - ${format(filters.comparePeriod.end, 'dd MMM yyyy', { locale: fr })}`
                  : 'Sélectionner comparatif'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.comparePeriod?.start,
                  to: filters.comparePeriod?.end,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    onFiltersChange({ ...filters, comparePeriod: { start: range.from, end: range.to } });
                  }
                }}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )}

        <div className="flex-1" />

        {/* Product Search */}
        {/* <div className="relative w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={filters.searchProduct || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchProduct: e.target.value })
            }
            className="pl-8 h-9 bg-background"
          />
        </div> */}

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



