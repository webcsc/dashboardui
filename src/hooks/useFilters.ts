import { useState, useCallback } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import type { FilterState } from "@/types";

const getDefaultFilters = (): FilterState => ({
  period: {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  },
  comparePeriod: undefined,
  segments: [],
  regions: [],
  clientTypes: [],
});

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters);

  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  const isComparing = filters.comparePeriod !== undefined;

  const hasActiveFilters =
    filters.segments.length > 0 ||
    filters.regions.length > 0 ||
    filters.clientTypes.length > 0;

  return {
    filters,
    updateFilters,
    resetFilters,
    isComparing,
    hasActiveFilters,
  };
}

