import { useState } from "react";
import { Leaf, TreeDeciduous, Cloud } from "lucide-react";
import { DataTableModal, TableColumn } from "../modals/DataTableModal";

interface ImpactCardProps {
    totalOcoc: number;
    trees: number;
    co2: number;
}

// Mock historical data
const impactHistoryData = [
    { mois: "Janvier", ococ: 9800, arbres: 2240, co2: 112 },
    { mois: "Février", ococ: 10200, arbres: 2330, co2: 118 },
    { mois: "Mars", ococ: 10850, arbres: 2480, co2: 124 },
    { mois: "Avril", ococ: 11300, arbres: 2580, co2: 130 },
    { mois: "Mai", ococ: 11900, arbres: 2720, co2: 136 },
    { mois: "Juin", ococ: 12450, arbres: 2847, co2: 142 },
];

const tableColumns: TableColumn[] = [
    { key: "mois", label: "Mois" },
    { key: "ococ", label: "€ OCOC", format: (v) => `${(v || 0).toLocaleString()}€` },
    { key: "arbres", label: "Arbres financés", format: (v) => (v || 0).toLocaleString() },
    { key: "co2", label: "tCO₂e évités", format: (v) => `${v}t` },
];

export function ImpactCard({ totalOcoc, trees, co2 }: ImpactCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div
                className="chart-container bg-gradient-to-br from-segment-b2c-light to-card cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-segment-b2c" />
                        Impact One Cup One Cent
                    </h3>
                    <span className="text-xs text-muted-foreground underline">Voir historique</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-card/80 rounded-xl">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-segment-b2c-light mb-3">
                            <span className="text-2xl">☕</span>
                        </div>
                        <p className="kpi-value text-segment-b2c">{(totalOcoc || 0).toLocaleString()}€</p>
                        <p className="kpi-label">OCOC générés</p>
                    </div>
                    <div className="text-center p-4 bg-card/80 rounded-xl">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-segment-b2c-light mb-3">
                            <TreeDeciduous className="h-6 w-6 text-segment-b2c" />
                        </div>
                        <p className="kpi-value text-segment-b2c">{(trees || 0).toLocaleString()}</p>
                        <p className="kpi-label">Arbres financés</p>
                    </div>
                    <div className="text-center p-4 bg-card/80 rounded-xl">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-segment-b2c-light mb-3">
                            <Cloud className="h-6 w-6 text-segment-b2c" />
                        </div>
                        <p className="kpi-value text-segment-b2c">{co2}t</p>
                        <p className="kpi-label">CO₂e évités</p>
                    </div>
                </div>
            </div>

            <DataTableModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                title="Historique Impact OCOC"
                columns={tableColumns}
                data={impactHistoryData}
                variant="b2c"
            />
        </>
    );
}



