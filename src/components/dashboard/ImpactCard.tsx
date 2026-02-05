import { Leaf, TreeDeciduous, Cloud } from "lucide-react";

interface ImpactCardProps {
  totalOcoc: number;
  trees: number;
  co2: number;
}

export function ImpactCard({ totalOcoc, trees, co2 }: ImpactCardProps) {
  return (
    <div className="chart-container bg-gradient-to-br from-segment-b2c-light to-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Leaf className="h-5 w-5 text-segment-b2c" />
        Impact One Cup One Cent
      </h3>
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
  );
}



