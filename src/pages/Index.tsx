import { useState, lazy, Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/layout/DashboardHeader';
import { SegmentTabs } from '@/components/dashboard/layout/SegmentTabs';
import { FilterBar } from '@/components/dashboard/layout/FilterBar';
import { useFilters } from '@/hooks/useFilters';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Lazy loading des Views pour améliorer les performances
 * Chaque View est chargée uniquement quand elle est nécessaire
 * 
 * Note: Les Views doivent utiliser export default pour le lazy loading
 */
const GrandsComptesView = lazy(() => import(/* webpackChunkName: "view-gc" */ '@/components/dashboard/views/GrandsComptesView').then(m => ({ default: m.GrandsComptesView })));
const PlugPlayView = lazy(() => import(/* webpackChunkName: "view-pp" */ '@/components/dashboard/views/PlugPlayView').then(m => ({ default: m.PlugPlayView })));
const B2CView = lazy(() => import(/* webpackChunkName: "view-b2c" */ '@/components/dashboard/views/B2CView').then(m => ({ default: m.B2CView })));
const CafeView = lazy(() => import(/* webpackChunkName: "view-cafe" */ '@/components/dashboard/views/CafeView').then(m => ({ default: m.CafeView })));
const EquipementView = lazy(() => import(/* webpackChunkName: "view-equipement" */ '@/components/dashboard/views/EquipementView').then(m => ({ default: m.EquipementView })));
const ServiceView = lazy(() => import(/* webpackChunkName: "view-service" */ '@/components/dashboard/views/ServiceView').then(m => ({ default: m.ServiceView })));
const RecapKpiView = lazy(() => import(/* webpackChunkName: "view-recap-kpi" */ '@/components/dashboard/views/RecapKpiView').then(m => ({ default: m.RecapKpiView })));
const RecapUniversView = lazy(() => import(/* webpackChunkName: "view-recap-univers" */ '@/components/dashboard/views/RecapUniversView').then(m => ({ default: m.RecapUniversView })));

/**
 * Composant de fallback affiché pendant le chargement d'une View
 */
const ViewSkeleton = () => (
  <div className="space-y-6 animate-fade-in" role="status" aria-label="Chargement des données">
    {/* KPIs Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
    {/* Charts Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
    <span className="sr-only">Chargement en cours...</span>
  </div>
);

const Index = () => {
  const [activeSegment, setActiveSegment] = useState('recap-univers');
  const { filters, updateFilters, isComparing } = useFilters();

  const renderView = () => {
    const viewProps = { filters, isComparing };

    switch (activeSegment) {
      case 'recap-kpi':
        return <RecapKpiView {...viewProps} />;
      case 'gc':
        return <GrandsComptesView {...viewProps} />;
      case 'pp':
        return <PlugPlayView {...viewProps} />;
      case 'b2c':
        return <B2CView {...viewProps} />;
      case 'recap-univers':
        return <RecapUniversView {...viewProps} />;
      case 'cafe':
        return <CafeView {...viewProps} />;
      case 'equipement':
        return <EquipementView {...viewProps} />;
      case 'service':
        return <ServiceView {...viewProps} />;
      default:
        return <RecapUniversView {...viewProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-4 mb-6">
          <SegmentTabs value={activeSegment} onValueChange={setActiveSegment} />
          <FilterBar filters={filters} onFiltersChange={updateFilters} />
        </div>

        {/* Suspense wrapper pour lazy loading */}
        <Suspense fallback={<ViewSkeleton />}>
          {renderView()}
        </Suspense>
      </main>
    </div>
  );
};

export default Index;

