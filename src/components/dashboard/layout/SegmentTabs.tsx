import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Zap, User, Coffee, Settings, Wrench, LayoutDashboard, BarChart3, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface SegmentTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

type GroupType = "kpi" | "univers";

const KPI_TABS = ["recap-kpi", "gc", "pp", "b2c"];
const UNIVERS_TABS = ["recap-univers", "cafe", "equipement", "service"];

export function SegmentTabs({ value, onValueChange }: SegmentTabsProps) {
  const [activeGroup, setActiveGroup] = useState<GroupType>(() => {
    // Determine initial group based on current value
    if (KPI_TABS.includes(value)) return "kpi";
    return "univers";
  });

  // Sync group when value changes externally
  useEffect(() => {
    if (KPI_TABS.includes(value)) {
      setActiveGroup("kpi");
    } else if (UNIVERS_TABS.includes(value)) {
      setActiveGroup("univers");
    }
  }, [value]);

  const handleGroupChange = (group: GroupType) => {
    if (group === activeGroup) return;
    setActiveGroup(group);
    // Switch to recap of the selected group
    onValueChange(group === "kpi" ? "recap-kpi" : "recap-univers");
  };

  return (
    <div className="space-y-4">
      {/* Toggle Switch pour les groupes */}
      <div className="flex items-center bg-muted rounded-lg p-1 w-fit">
        <button
          onClick={() => handleGroupChange("kpi")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeGroup === "kpi"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">KPI Stratégique</span>
          <span className="sm:hidden">KPI</span>
        </button>
        <button
          onClick={() => handleGroupChange("univers")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeGroup === "univers"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Box className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard par Univers</span>
          <span className="sm:hidden">Univers</span>
        </button>
      </div>

      {/* Onglets du groupe actif */}
      {activeGroup === "kpi" ? (
        <Tabs value={value} onValueChange={onValueChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-11 bg-secondary/50">
            <TabsTrigger
              value="recap-kpi"
              className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Récapitulatif</span>
              <span className="sm:hidden">Récap</span>
            </TabsTrigger>
            <TabsTrigger
              value="gc"
              className="flex items-center gap-1.5 data-[state=active]:bg-segment-gc data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Grands Comptes</span>
              <span className="sm:hidden">GC</span>
            </TabsTrigger>
            <TabsTrigger
              value="pp"
              className="flex items-center gap-1.5 data-[state=active]:bg-segment-pp data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Plug & Play</span>
              <span className="sm:hidden">P&P</span>
            </TabsTrigger>
            <TabsTrigger
              value="b2c"
              className="flex items-center gap-1.5 data-[state=active]:bg-segment-b2c data-[state=active]:text-white text-xs sm:text-sm"
            >
              <User className="h-4 w-4" />
              <span>B2C</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <Tabs value={value} onValueChange={onValueChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-11 bg-secondary/50">
            <TabsTrigger
              value="recap-univers"
              className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Récapitulatif</span>
              <span className="sm:hidden">Récap</span>
            </TabsTrigger>
            <TabsTrigger
              value="cafe"
              className="flex items-center gap-1.5 data-[state=active]:bg-universe-cafe data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Coffee className="h-4 w-4" />
              <span>Café</span>
            </TabsTrigger>
            <TabsTrigger
              value="equipement"
              className="flex items-center gap-1.5 data-[state=active]:bg-universe-equipement data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Équipement</span>
              <span className="sm:hidden">Équip.</span>
            </TabsTrigger>
            <TabsTrigger
              value="service"
              className="flex items-center gap-1.5 data-[state=active]:bg-universe-service data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Wrench className="h-4 w-4" />
              <span>Service</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </div>
  );
}



