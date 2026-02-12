
import { DistributionItem, DistributionResponse, EquipementMonthData, EvolutionResponse, ServiceMonthData } from "@/services/dashboard-api";
import { KG_THRESHOLD, GRAMS_PER_KG, MONTH_ORDER, DEFAULT_EVOLUTION_MONTHS, EQUIPEMENT_UNIVERSE_MAPPING, FRENCH_MONTHS } from "./dashboard-constants";

/**
 * Transforms distribution data for pie chart and table display
 * 
 * Converts raw distribution API data into a format suitable for visualization,
 * with proper unit formatting (kg/g) and sorting by percentage.
 * 
 * @param distribution - Raw distribution data from the API
 * @returns Array of formatted distribution items sorted by percentage (descending)
 * 
 * @example
 * ```ts
 * const data = transformDistributionData(apiResponse.distribution);
 * // Returns: [
 * //   { name: "6 kg", ca: 50000, part: 80.77, volume: 6000, raw_poid_unit: 6 },
 * //   { name: "1 kg", ca: 10000, part: 15.23, volume: 1000, raw_poid_unit: 1 },
 * //   { name: "250 g", ca: 2000, part: 4.00, volume: 250, raw_poid_unit: 0.25 }
 * // ]
 * ```
 */
export const transformDistributionData = (distribution: DistributionResponse['distribution'] | undefined) => {
    if (!distribution) return [];

    return Object.entries(distribution)
        .map(([key, item]: [string, DistributionItem]) => ({
            name: item.poid_unit
                ? Number(item.poid_unit) >= KG_THRESHOLD
                    ? `${item.poid_unit} kg`
                    : `${(parseFloat(item.poid_unit) * GRAMS_PER_KG).toFixed(0)} g`
                : key,
            ca: item.ca_total_ht,
            volume: item.poids_total,
            part: Number(item.percentage_kg) || 0,
            // Keep raw values if needed
            raw_poid_unit: item.poid_unit,
        }))
        .sort((a, b) => b.part - a.part);
};

/**
 * Transforms evolution data for bar chart and table display
 * 
 * Handles both nested (year → month → data) and flat (month → data) structures.
 * Automatically sorts data chronologically and applies year labels when needed.
 * Implements 12-month rolling window for consistent visualization.
 * 
 * @param evolution - Raw evolution data from the API
 * @param currentYear - Current year for comparison (determines when to show year labels)
 * @param maxMonths - Maximum number of months to return (default: 12, creates rolling window)
 * @returns Array of formatted evolution items sorted chronologically
 * 
 * @example
 * ```ts
 * // Multi-year data
 * const data = transformEvolutionData(apiResponse.data, "2026", 12);
 * // Returns last 12 months with year labels: [
 * //   { mois: "Mar 2025", ca: 10000, volume: 500, part_b2b: 75.5 },
 * //   { mois: "Apr 2025", ca: 12000, volume: 600, part_b2b: 76.2 },
 * //   ...
 * //   { mois: "Feb 2026", ca: 15000, volume: 750, part_b2b: 78.1 }
 * // ]
 * 
 * // Single year data
 * const data = transformEvolutionData(apiResponse.data, "2026");
 * // Returns: [{ mois: "Jan", ca: 10000, volume: 500, ... }, ...]
 * ```
 */
/**
 * Transforms evolution data for bar chart and table display (Cafe Universe)
 * 
 * Handles nested structure: Year -> Month -> Cafe Object
 * Structure: { "2026": { "January": { "cafe": { ... } } } }
 * 
 * @param evolution - Raw evolution data from the API
 * @param currentYear - Current year for comparison (determines when to show year labels)
 * @param maxMonths - Maximum number of months to return (default: 12, creates rolling window)
 * @returns Array of formatted evolution items sorted chronologically
 */
export const transformEvolutionData = <T>(
    evolution: EvolutionResponse<T>['data'] | undefined,
    currentYear: string,
    maxMonths?: number,
    includeFuture: boolean = false,
    period?: { start: Date; end: Date }
) => {
    if (!evolution) return [];

    // Filter out 'total' key and ensure we only process year keys
    const yearKeys = Object.keys(evolution).filter(key => key !== 'total' && /^\d{4}$/.test(key)).sort();

    if (includeFuture && !yearKeys.includes(currentYear)) {
        yearKeys.push(currentYear);
        yearKeys.sort();
    }

    const isMoreAYear = yearKeys.length > 1 || yearKeys.some(y => y !== currentYear);

    const allData = yearKeys.flatMap(year => {
        const yearData = evolution[year];

        return MONTH_ORDER.map(month => {
            const cafeData = yearData?.[month]?.cafe;
            const monthIndex = MONTH_ORDER.indexOf(month); // 0-11

            // Check if this month is within the selected period
            let isActif = 1;
            if (period) {
                const itemDate = new Date(parseInt(year), monthIndex, 15); // Use 15th to avoid timezone issues
                // Reset hours to compare dates only
                const start = new Date(period.start); start.setHours(0, 0, 0, 0);
                const end = new Date(period.end); end.setHours(23, 59, 59, 999);
                // Also set itemDate hours to noon
                itemDate.setHours(12, 0, 0, 0);

                // Compare Year and Month
                const itemTime = itemDate.getFullYear() * 12 + itemDate.getMonth();
                const startTime = start.getFullYear() * 12 + start.getMonth();
                const endTime = end.getFullYear() * 12 + end.getMonth();

                isActif = (itemTime >= startTime && itemTime <= endTime) ? 1 : 0;
            }

            if (!cafeData) {
                if (includeFuture && year === currentYear) {
                    return {
                        mois: `${FRENCH_MONTHS[month]}${isMoreAYear ? ' ' + year : ''}`,
                        ca: 0,
                        volume: 0,
                        part_b2b: 0,
                        actif: 0, // Future/Empty is always 0
                        year: year,
                        monthIndex: monthIndex
                    };
                }
                return null;
            }

            return {
                mois: `${FRENCH_MONTHS[month]}${isMoreAYear ? ' ' + year : ''}`,
                ca: cafeData.ca_total_ht,
                volume: cafeData.volume_total,
                part_b2b: cafeData.part_b2b || 0,
                actif: isActif,
                year: year,
                monthIndex: monthIndex
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);
    });

    return filterLastMonthsData(allData, maxMonths, includeFuture);
};

/**
 * Transforme les données de distribution pour l'affichage Service (Pie Chart + Table)
 */

/**
 * Transforms Service distribution data for pie chart display
 * 
 * Formats service universe distribution data with proper naming and sorting.
 * 
 * @param distribution - Raw distribution data from the Service API
 * @returns Array of formatted distribution items sorted by percentage (descending)
 * 
 * @example
 * ```ts
 * const data = transformServiceDistribution(apiResponse.distribution);
 * // Returns: [
 * //   { name: "Réparation", ca: 30000, part: 45.5, ... },
 * //   { name: "Installation", ca: 20000, part: 30.3, ... }
 * // ]
 * ```
 */
export const transformServiceDistribution = (distribution: DistributionResponse['distribution'] | undefined) => {
    if (!distribution) return [];
    return Object.entries(distribution)
        .map(([key, item]: [string, DistributionItem]) => ({
            name: item.poid_unit || key,
            ca: item.total_ht,
            value: Number(item.percentage_ht) || 0,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);
};

/**
 * Transforms Service evolution data for stacked bar chart display
 * 
 * Aggregates service universe data by month, creating breakdown by service type
 * (réparation, installation, cartouche, prêt, échange).
 * 
 * @param evolution - Raw evolution data from the Service API
 * @param currentYear - Current year for comparison (determines year label display)
 * @param maxMonths - Maximum number of months to return (default: 12)
 * @returns Array of formatted evolution items with service type breakdown
 * 
 * @example
 * ```ts
 * const data = transformServiceEvolution(apiResponse.data, "2026", 12);
 * // Returns: [
 * //   { mois: "Jan", reparation: 5000, installation: 3000, cartouche: 2000, pret: 0, echange: 0, total: 10000 },
 * //   { mois: "Feb", reparation: 5500, installation: 3200, cartouche: 2100, pret: 100, echange: 50, total: 10950 }
 * // ]
 * ```
 */
/**
 * Transforms Service evolution data for stacked bar chart display
 * 
 * Handles nested structure: Year -> Month -> Array of Service Objects
 * Structure: { "2026": { "January": [ { "universe": "installation", ... }, ... ] } }
 * 
 * @param evolution - Raw evolution data from the Service API
 * @param currentYear - Current year for comparison (determines year label display)
 * @param maxMonths - Maximum number of months to return (default: 12)
 * @returns Array of formatted evolution items with service type breakdown
 */
export const transformServiceEvolution = (
    evolution: EvolutionResponse<ServiceMonthData>['data'] | undefined,
    currentYear: string,
    maxMonths?: number,
    includeFuture: boolean = false,
    period?: { start: Date; end: Date }
) => {
    if (!evolution) return [];

    const yearKeys = Object.keys(evolution).filter(key => key !== 'total' && /^\d{4}$/.test(key)).sort();

    if (includeFuture && !yearKeys.includes(currentYear)) {
        yearKeys.push(currentYear);
        yearKeys.sort();
    }

    const isMoreAYearSvc = yearKeys.length > 1 || yearKeys.some(k => k !== currentYear);

    const allData = yearKeys.flatMap(year => {
        const yearData: ServiceMonthData = evolution[year];

        return MONTH_ORDER.map(month => {
            const monthItems = yearData?.[month];
            const monthIndex = MONTH_ORDER.indexOf(month);

            // Check if this month is within the selected period
            let isActif = 1;
            if (period) {
                const start = new Date(period.start); start.setHours(0, 0, 0, 0);
                const end = new Date(period.end); end.setHours(23, 59, 59, 999);

                // Compare Year and Month
                const itemTime = parseInt(year) * 12 + monthIndex;
                const startTime = start.getFullYear() * 12 + start.getMonth();
                const endTime = end.getFullYear() * 12 + end.getMonth();

                isActif = (itemTime >= startTime && itemTime <= endTime) ? 1 : 0;
            }

            if (!monthItems) {
                if (includeFuture && year === currentYear) {
                    return {
                        mois: `${FRENCH_MONTHS[month]}${isMoreAYearSvc ? ' ' + year : ''}`,
                        reparation: 0,
                        installation: 0,
                        cartouche: 0,
                        pret: 0,
                        echange: 0,
                        total: 0,
                        actif: 0,
                        year: year,
                        monthIndex: monthIndex
                    };
                }
                return null;
            }

            const monthData = monthItems;
            const aggregated = {
                mois: `${FRENCH_MONTHS[month]}${isMoreAYearSvc ? ' ' + year : ''}`,
                reparation: 0,
                installation: 0,
                cartouche: 0,
                pret: 0,
                echange: 0,
                total: 0,
                actif: isActif,
                year: year,
                monthIndex: monthIndex
            };

            const addTo = (key: keyof typeof aggregated, amount: number) => {
                if (typeof aggregated[key] === 'number') {
                    (aggregated[key] as number) += amount;
                }
            };

            Object.entries(monthData).forEach(([serviceType, data]) => {
                const amount = data.ca_total_ht || 0;
                aggregated.total += amount;

                switch (serviceType.toLowerCase()) {
                    case 'reparation': addTo('reparation', amount); break;
                    case 'installation': addTo('installation', amount); break;
                    case 'cartouche': addTo('cartouche', amount); break;
                    case 'pret': addTo('pret', amount); break;
                    case 'echange': addTo('echange', amount); break;
                }
            });
            return aggregated;
        }).filter((item): item is NonNullable<typeof item> => item !== null);
    });

    return filterLastMonthsData(allData, maxMonths, includeFuture);
};

/**
 * Transforms Equipement distribution data for pie chart display
 * 
 * Formats equipment universe distribution data with proper naming and sorting.
 * 
 * @param distribution - Raw distribution data from the Equipement API
 * @returns Array of formatted distribution items sorted by percentage (descending)
 * 
 * @example
 * ```ts
 * const data = transformEquipementDistribution(apiResponse.distribution);
 * // Returns: [
 * //   { name: "MACHINES", ca: 50000, part: 60.5, ... },
 * //   { name: "LOCATION MACHINES", ca: 20000, part: 24.2, ... }
 * // ]
 * ```
 */
export const transformEquipementDistribution = (distribution: DistributionResponse['distribution'] | undefined) => {
    if (!distribution) return [];
    return Object.entries(distribution)
        .map(([key, item]) => ({
            name: item.poid_unit || key,
            ca: item.total_ht,
            value: parseFloat(item.percentage_ht?.toLocaleString('fr-FR') || '0') || 0,
        }))
        .filter((item) => item.value >= 1)
        .sort((a, b) => b.value - a.value);
};

/**
 * Transforms Equipement evolution data for stacked bar chart display
 * 
 * Aggregates equipment universe data by month, creating breakdown by equipment type
 * (vente, location, assistance, entretien) using predefined universe mappings.
 * 
 * @param evolution - Raw evolution data from the Equipement API
 * @param currentYear - Current year for comparison (determines year label display)
 * @param maxMonths - Maximum number of months to return (default: 12)
 * @returns Array of formatted evolution items with equipment type breakdown
 * 
 * @example
 * ```ts
 * const data = transformEquipementEvolution(apiResponse.data, "2026", 12);
 * // Returns: [
 * //   { mois: "Jan", location: 3000, vente: 8000, assistance: 1500, entretien: 2000, total: 14500 },
 * //   { mois: "Feb", location: 3200, vente: 8500, assistance: 1600, entretien: 2100, total: 15400 }
 * // ]
 * ```
 */
/**
 * Transforms Equipement evolution data for stacked bar chart display
 * 
 * Handles nested structure: Year -> Month -> { [Category]: Data }
 * Structure: { "2026": { "January": { "MACHINES": { ... }, "LOCATION MACHINES": { ... } } } }
 * 
 * @param evolution - Raw evolution data from the API
 * @param currentYear - Current year for comparison (determines year label display)
 * @param maxMonths - Maximum number of months to return (default: 12)
 * @returns Array of formatted evolution items with equipment type breakdown
 */
export const transformEquipementEvolution = (
    evolution: EvolutionResponse<EquipementMonthData>['data'] | undefined,
    currentYear: string,
    maxMonths?: number,
    includeFuture: boolean = false,
    period?: { start: Date; end: Date }
) => {
    if (!evolution) return [];

    const yearKeys = Object.keys(evolution).filter(key => key !== 'total' && /^\d{4}$/.test(key)).sort();

    if (includeFuture && !yearKeys.includes(currentYear)) {
        yearKeys.push(currentYear);
        yearKeys.sort();
    }

    const isMoreAYear = yearKeys.length > 1 || yearKeys.some(y => y !== currentYear);

    // Flatten all data
    const allData = yearKeys.flatMap(year => {
        const yearData = evolution[year];

        return MONTH_ORDER.map(month => {
            const monthItems: EquipementMonthData = yearData?.[month];
            const monthIndex = MONTH_ORDER.indexOf(month);

            // Check if this month is within the selected period
            let isActif = 1;
            if (period) {
                const start = new Date(period.start); start.setHours(0, 0, 0, 0);
                const end = new Date(period.end); end.setHours(23, 59, 59, 999);

                // Compare Year and Month
                const itemTime = parseInt(year) * 12 + monthIndex;
                const startTime = start.getFullYear() * 12 + start.getMonth();
                const endTime = end.getFullYear() * 12 + end.getMonth();

                isActif = (itemTime >= startTime && itemTime <= endTime) ? 1 : 0;
            }

            if (!monthItems) {
                if (includeFuture && year === currentYear) {
                    return {
                        mois: `${FRENCH_MONTHS[month]}${isMoreAYear ? ' ' + year : ''}`,
                        location: 0,
                        vente: 0,
                        assistance: 0,
                        entretien: 0,
                        total: 0,
                        actif: 0,
                        year: year,
                        monthIndex: monthIndex
                    };
                }
                return null;
            }

            const stats = {
                vente: 0,
                location: 0,
                assistance: 0,
                entretien: 0
            };

            let total = 0;

            Object.entries(monthItems).forEach(([categoryKey, data]) => {
                const mappedKey = EQUIPEMENT_UNIVERSE_MAPPING[categoryKey];
                if (mappedKey && (mappedKey in stats)) {
                    // Cast key to allow indexing
                    stats[mappedKey] += data.ca_total_ht || 0;
                }
                total += data.ca_total_ht || 0;
            });

            return {
                mois: `${FRENCH_MONTHS[month]}${isMoreAYear ? ' ' + year : ''}`,
                location: stats.location,
                vente: stats.vente,
                assistance: stats.assistance,
                entretien: stats.entretien,
                total: total,
                actif: isActif,
                year: year,
                monthIndex: monthIndex
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);
    });

    return filterLastMonthsData(allData, maxMonths, includeFuture);
};

/**
 * Filters data to keep only the last N months relative to the current date.
 * Removes 'year' and 'monthIndex' from the result.
 * 
 * @param allData - List of data items containing year and monthIndex
 * @param maxMonths - Maximum number of months to return (defaults to DEFAULT_EVOLUTION_MONTHS if falsy)
 */
export const filterLastMonthsData = <T extends { year: string; monthIndex: number }>(
    allData: T[],
    maxMonths?: number,
    includeFuture: boolean = false
): Omit<T, 'year' | 'monthIndex'>[] => {
    // Always take the last 12 months (rolling window) OR full year if explicitly requested
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYearNum = now.getFullYear();

    const filteredData = allData.filter(item => {
        const itemYear = parseInt(item.year);
        // keep past years
        if (itemYear < currentYearNum) return true;

        // current year: 
        if (includeFuture) {
            // Keep all months for the current year
            return true;
        }

        // discard future years
        if (itemYear > currentYearNum) return false;

        // current year legacy behavior: keep months up to current
        return item.monthIndex <= currentMonthIndex;
    });

    const targetMonthCount = maxMonths || DEFAULT_EVOLUTION_MONTHS;
    // Create new objects without year and monthIndex
    return filteredData.slice(-targetMonthCount).map(({ year, monthIndex, ...item }) => item);
};
