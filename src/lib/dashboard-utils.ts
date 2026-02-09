
import { DistributionResponse, EvolutionResponse } from "@/services/dashboard-api";

/**
 * Transforme les données de distribution pour l'affichage (Pie Chart + Table)
 */
export const transformDistributionData = (distribution: DistributionResponse['distribution'] | undefined) => {
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
            // Keep raw values if needed
            raw_poid_unit: item.poid_unit,
        }))
        .sort((a, b) => b.part - a.part);
};

/**
 * Transforme les données d'évolution pour l'affichage (Bar Chart + Table)
 */
export const transformEvolutionData = (
    evolution: EvolutionResponse['data'] | undefined,
    currentYear: string,
    maxMonths?: number
) => {
    if (!evolution) return [];

    const keys = Object.keys(evolution);
    const hasYearKeys = keys.some(k => /^\d{4}$/.test(k));
    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (hasYearKeys) {
        const yearsToProcess = (keys.length > 0 ? keys : [currentYear]).sort();
        const isMoreAYear = yearsToProcess.length > 1 || yearsToProcess.some(y => y !== currentYear);

        return yearsToProcess.flatMap(year => {
            const yearData = evolution[year];
            if (!yearData) return [];

            return Object.entries(yearData)
                .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
                .filter(([month]) => monthOrder.includes(month)) // Filter out non-month keys
                .map(([month, data]: [string, any]) => ({
                    mois: `${month.substring(0, 3)}${isMoreAYear ? ' ' + year : ''}`,
                    ca: data.ca_total_ht,
                    volume: data.volume_total,
                    part_b2b: data.part_b2b
                }));
        });

        // Always show 12 months (or all available if less than 12)
        // Take the most recent 12 months to create a rolling window
        const allData = yearsToProcess.flatMap(year => {
            const yearData = evolution[year];
            if (!yearData) return [];

            return Object.entries(yearData)
                .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
                .filter(([month]) => monthOrder.includes(month)) // Filter out non-month keys
                .map(([month, data]: [string, any]) => ({
                    mois: `${month.substring(0, 3)}${isMoreAYear ? ' ' + year : ''}`,
                    ca: data.ca_total_ht,
                    volume: data.volume_total,
                    part_b2b: data.part_b2b,
                    year: year,
                    monthIndex: monthOrder.indexOf(month)
                }));
        });

        // Always take the last 12 months (rolling window)
        // This ensures short periods (1 month, 3 months) still show 12 months of history
        const targetMonthCount = maxMonths || 12;
        if (allData.length > targetMonthCount) {
            return allData.slice(-targetMonthCount).map(({ year, monthIndex, ...item }) => item);
        }

        return allData.map(({ year, monthIndex, ...item }) => item);
    } else {
        // Flat structure (Month -> Data)
        // Check if there are valid month keys to confirm it's not empty or garbage
        return Object.entries(evolution)
            .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
            .filter(([month]) => monthOrder.includes(month))
            .map(([month, data]: [string, any]) => ({
                mois: month.substring(0, 3),
                ca: data.ca_total_ht,
                volume: data.volume_total,
                part_b2b: data.part_b2b
            }));
    }
};

/**
 * Transforme les données de distribution pour l'affichage Service (Pie Chart + Table)
 */
export const transformServiceDistribution = (distribution: DistributionResponse['distribution'] | undefined) => {
    if (!distribution) return [];
    return Object.entries(distribution)
        .map(([key, item]: [string, any]) => ({
            name: item.poid_unit || key,
            ca: item.total_ht,
            value: parseFloat(item.percentage_ht) || 0,
        }))
        .filter((item) => item.value >= 1)
        .sort((a, b) => b.value - a.value);
};

/**
 * Transforme les données d'évolution pour l'affichage Service (Bar Chart + Table)
 */
export const transformServiceEvolution = (
    evolution: EvolutionResponse['data'] | undefined,
    currentYear: string,
    maxMonths?: number
) => {
    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const isMoreAYear = evolution && (Object.entries(evolution).length > 2); // Fallback for flat data?? No.
    // Wait, transformServiceEvolution logic was weird in previous snippet. 
    // Let's look at the file content in Step 432.
    // It used `isMoreAYear = evolution && (Object.entries(evolution)?.length > 2);`
    // And Step 436 replaced simple `.sort`.
    // I should rewrite the `isMoreAYear` check properly for Service too.

    // Actually, `ServiceView` might be using Flat data too? 
    // "Service" implementation in Step 344 suggests nested: `modalOverviewResponse` etc.
    // The previous transformServiceEvolution (Step 432 lines 86-130) handles iteration.
    // It assumes nested logic in the map? 
    // `Object.entries(evolution).flatMap(([year, yearData])` -> This implies Nested.
    // So I should use the year keys.

    const keys = evolution ? Object.keys(evolution) : [];
    const isMoreAYearSvc = keys.length > 1 || keys.some(k => k !== currentYear);

    const data = evolution ? Object.entries(evolution)
        .sort(([yearA], [yearB]) => yearA.localeCompare(yearB)) // Sort years ascending
        .flatMap(([year, yearData]) =>
            Object.entries(yearData)
                .filter(([month]) => monthOrder.includes(month)) // Exclude 'total' and other non-month keys
                .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
                .map(([month, monthItems]) => {
                    const monthData = Array.isArray(monthItems) ? monthItems : [monthItems];
                    const aggregated = {
                        mois: `${month.substring(0, 3)}${isMoreAYearSvc ? ' ' + year : ''}`,
                        reparation: 0,
                        installation: 0,
                        cartouche: 0,
                        pret: 0,
                        echange: 0,
                        total: 0
                    };
                    monthData.forEach((item: { universe: string; ca_total_ht: number }) => {
                        aggregated.total += item.ca_total_ht;
                        if (item.universe === 'reparation') aggregated.reparation += item.ca_total_ht;
                        else if (item.universe === 'installation') aggregated.installation += item.ca_total_ht;
                        else if (item.universe === 'cartouche') aggregated.cartouche += item.ca_total_ht;
                        else if (item.universe === 'pret') aggregated.pret += item.ca_total_ht;
                        else if (item.universe === 'echange') aggregated.echange += item.ca_total_ht;
                    });
                    return aggregated;
                })
        ) : [];

    // Always take the last 12 months (rolling window)
    // This ensures short periods (1 month, 3 months) still show 12 months of history
    const targetMonthCount = maxMonths || 12;
    if (data.length > targetMonthCount) {
        return data.slice(-targetMonthCount);
    }

    return data;
};
export const transformEquipementDistribution = (distribution: DistributionResponse['distribution'] | undefined) => {
    if (!distribution) return [];
    return Object.entries(distribution)
        .map(([key, item]: [string, any]) => ({
            name: item.poid_unit || key,
            ca: item.ca_total_ht,
            value: parseFloat(item.percentage) || 0,
        }))
        .sort((a, b) => b.value - a.value);
};

/**
 * Transforme les données d'évolution pour l'affichage Équipement (Bar Chart + Table)
 */
export const transformEquipementEvolution = (
    evolution: EvolutionResponse['data'] | undefined,
    currentYear: string,
    maxMonths?: number
) => {
    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (!evolution) return [];

    const years = Object.keys(evolution).sort();
    const isMoreAYear = years.length > 1 || years.some(y => y !== currentYear);

    return years.flatMap(year => {
        const yearData = evolution[year];
        return Object.entries(yearData)
            .filter(([month]) => monthOrder.includes(month)) // Exclude 'total' and other non-month keys
            .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
            .map(([month, data]: [string, any]) => {
                // Ensure data is an array (API might return single object or array)
                const dataArray = Array.isArray(data) ? data : [data];

                const stats = dataArray.reduce((acc: any, item: any) => {
                    const mapping: Record<string, string> = {
                        "MACHINES": "vente",
                        "LOCATION MACHINES": "location",
                        "Assistance Premium": "assistance",
                        "PACK ENTRETIEN": "entretien"
                    };
                    const key = mapping[item.universe];
                    if (key) {
                        acc[key] = item.ca_total_ht;
                    }
                    return acc;
                }, {});

                return {
                    mois: `${month.substring(0, 3)}${isMoreAYear ? ' ' + year : ''}`,
                    location: stats.location || 0,
                    vente: stats.vente || 0,
                    assistance: stats.assistance || 0,
                    entretien: stats.entretien || 0,
                    total: dataArray.map((universData: any) => universData.ca_total_ht).reduce((a: number, b: number) => a + b, 0)
                };
            });
    });

    // Flatten all data
    const allData = years.flatMap(year => {
        const yearData = evolution[year];
        return Object.entries(yearData)
            .filter(([month]) => monthOrder.includes(month)) // Exclude 'total' and other non-month keys
            .sort(([monthA], [monthB]) => monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB))
            .map(([month, data]: [string, any]) => {
                // Ensure data is an array (API might return single object or array)
                const dataArray = Array.isArray(data) ? data : [data];

                const stats = dataArray.reduce((acc: any, item: any) => {
                    const mapping: Record<string, string> = {
                        "MACHINES": "vente",
                        "LOCATION MACHINES": "location",
                        "Assistance Premium": "assistance",
                        "PACK ENTRETIEN": "entretien"
                    };
                    const key = mapping[item.universe];
                    if (key) {
                        acc[key] = item.ca_total_ht;
                    }
                    return acc;
                }, {});

                return {
                    mois: `${month.substring(0, 3)}${isMoreAYear ? ' ' + year : ''}`,
                    location: stats.location || 0,
                    vente: stats.vente || 0,
                    assistance: stats.assistance || 0,
                    entretien: stats.entretien || 0,
                    total: dataArray.map((universData: any) => universData.ca_total_ht).reduce((a: number, b: number) => a + b, 0)
                };
            });
    });

    // Always take the last 12 months (rolling window)
    // This ensures short periods (1 month, 3 months) still show 12 months of history  
    const targetMonthCount = maxMonths || 12;
    if (allData.length > targetMonthCount) {
        return allData.slice(-targetMonthCount);
    }

    return allData;
};
