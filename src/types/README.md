# Types CSC Dashboard

Ce module contient tous les types TypeScript partagés utilisés dans l'application CSC Dashboard.

## Types Principaux

### FilterState

État complet des filtres du dashboard (périodes, segments, régions, etc.)

### TableColumn

Définition d'une colonne de tableau avec formatage optionnel.

### ComponentVariant

Union type pour tous les variants visuels possibles (segments + univers + default).

### TrendData

Données structurées pour afficher une tendance (valeur, direction, label).

## Usage

```typescript
import type { FilterState, ComponentVariant } from '@/types';

const filters: FilterState = {
  period: { start: new Date(), end: new Date() },
  segments: ['gc', 'pp'],
  // ...
};
```

## Documentation API

Consultez la documentation TypeDoc générée pour plus de détails sur chaque type.
