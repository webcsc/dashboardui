# Configuration CSC Dashboard

Ce module centralise toute la configuration visuelle et métadonnées pour les segments et univers.

## Fichiers

### segments.ts

Configuration des segments business : Grands Comptes (GC), Plug & Play (PP), B2C.

Chaque segment contient :

- Label affiché
- Icône Lucide
- Couleur HSL
- Classes Tailwind pour tous les états visuels

### universes.ts

Configuration des univers produits : Café, Équipement, Service.

Structure identique aux segments mais adaptée aux univers.

### constants.ts

Constantes globales : presets de périodes, régions, types de clients, configuration cache.

## Usage

```typescript
import { SEGMENT_CONFIG } from '@/config/segments';
import { UNIVERSE_CONFIG } from '@/config/universes';

const gcConfig = SEGMENT_CONFIG.gc;
console.log(gcConfig.label); // "Grands Comptes"
console.log(gcConfig.styles.bg); // "bg-segment-gc"
```

## Avantages

**Source unique de vérité** - Toute modification de style se fait en un seul endroit  
**Type-safe** - Avec `as const` pour l'inférence TypeScript  
**Cohérence** - Garantit que tous les composants utilisent les mêmes valeurs
