
import { transformEvolutionData } from './src/lib/dashboard-utils';
import { BaseMonthData } from './src/services/dashboard-api';

// Mock the constants since we can't easily import them in a standalone node script without setup
// But we can just paste strict logic if needed, or rely on ts-node if environment allows.
// For now, I'll rely on the existing code structure and just create a test file that imports them.

const mockData = {
    "2026": {
        "January": {
            "cafe": {
                "actif": 0,
                "nombre_facture": 131,
                "nombre_product": 207,
                "ca_total_ht": 70770.31,
                "volume_total": 2840
            }
        },
        // ... (abbreviated for brevity, but logic should handle one month)
        "February": {
            "cafe": {
                "ca_total_ht": 9171.4,
                "volume_total": 360
            }
        }
    },
    "total": {
        "ca_total_ht_global": 79941.71,
        "volume_total_global": 3200,
        "univers": "cafe"
    }
};

const result = transformEvolutionData<BaseMonthData>(mockData, "2026");
console.log("Transformation Result:", JSON.stringify(result, null, 2));

if (result.length === 0) {
    console.error("Result is empty!");
}
if (result.some(r => r.ca === 0 && r.mois.includes("Jan"))) {
    console.error("January data is zeroed out!");
}
