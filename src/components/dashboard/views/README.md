# Dashboard Views

Composants de vues complètes pour chaque segment et univers.

## Structure

Chaque View affiche :

- KPIs principaux avec cartes
- Graphiques de visualisation (Recharts)
- Tables de données détaillées dans modals
- État de chargement avec skeletons

## Vues Disponibles

### Segments

- **GrandsComptesView** : Vue Grands Comptes (GC)
- **PlugPlayView** : Vue Plug & Play (PP)
- **B2CView** : Vue B2C avec impact OCOC

### Univers

- **CafeView** : Vue univers Café
- **EquipementView** : Vue univers Équipement
- **ServiceView** : Vue univers Service

### Récapitulatifs

- **RecapKpiView** : Récapitulatif KPIs globaux
- **RecapUniversView** : Récapitulatif par univers

## Lazy Loading

Toutes les Views sont chargées de façon asynchrone depuis `Index.tsx` :

- Bundle initial réduit
- Chargement à la demande
- Code splitting automatique

## Props

Toutes les Views reçoivent les mêmes props :

```tsx
interface ViewProps {
  filters: FilterState;  // Filtres appliqués
  isComparing: boolean;  // Mode comparaison activé
}
```
