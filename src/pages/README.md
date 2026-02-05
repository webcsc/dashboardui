# Pages - CSC Dashboard

Page principale du dashboard avec navigation et lazy loading.

## Index.tsx

Page principale qui gère :

- **Lazy loading** de toutes les Views avec React.lazy()
- **Suspense** avec skeleton de chargement
- **Navigation** via SegmentTabs
- **Filtres** via FilterBar et useFilters hook
- **Code splitting** automatique par route (configuré dans vite.config.mts)

### ViewSkeleton

Composant de fallback affiché pendant le chargement asynchrone d'une View.

Features :

- Grille de KPIs skeletons (4 cards)
- Grille de charts skeletons (2 charts)
- Animation fade-in
- Accessibilité avec role="status" et message sr-only

### Lazy Loading

Toutes les Views sont chargées de façon asynchrone :

```tsx
const CafeView = lazy(() => 
  import('@/components/dashboard/views/CafeView')
    .then(m => ({ default: m.CafeView }))
);
```

Cela réduit le bundle initial et améliore les performances de chargement.

## Performance

### Bundle size optimization

- Views séparées en chunks distincts via webpackChunkName
- Vendor libs regroupés (react, ui, charts, query)
- Lazy loading = chargement à la demande

### Benchmarks

Run `ANALYZE=true npm run build` pour visualiser la taille des bundles.
