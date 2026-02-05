# Hooks CSC Dashboard

Custom React hooks pour la gestion de l'état et des données du dashboard.

## Hooks Disponibles

### useFilters

Hook existant pour gérer l'état des filtres du dashboard.

### useModalState

Gère l'état d'ouverture/fermeture de plusieurs modals.

**API:**

- `openModals`: Objet Record<string, boolean> avec l'état de chaque modal
- `openModal(id)`: Ouvre un modal spécifique
- `closeModal(id)`: Ferme un modal spécifique
- `toggleModal(id)`: Toggle un modal
- `closeAll()`: Ferme tous les modals
- `isAnyOpen`: Boolean indiquant si au moins un modal est ouvert

**Usage:**

```tsx
const { openModals, openModal, closeModal } = useModalState(['format', 'evolution']);

<DataTableModal 
  open={openModals.format} 
  onOpenChange={(open) => open ? openModal('format') : closeModal('format')}
/>
```

### useDashboardData

Charge les données d'une vue avec React Query (cache, retry, etc.).

**Paramètres:**

- `view`: Identifiant de la vue
- `filters`: FilterState

**Retour:** Query result avec `data`, `isLoading`, `error`, `refetch`, etc.

**Usage:**

```tsx
const { data, isLoading, error } = useDashboardData('cafe', filters);
```

### usePrefetchDashboardData

Pré-charge les données d'une vue pour améliorer l'UX.

**Usage:**

```tsx
const prefetchCafe = usePrefetchDashboardData('cafe', filters);
// Appeler prefetchCafe() au hover d'un bouton
```

## Optimisations

- **React Query** : Cache automatique avec config personnalisée (5 min stale time)
- **Retry strategy** : Retry exponentiel avec max 30s
- **Placeholder data** : Garde les anciennes données pendant le rechargement
