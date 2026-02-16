# Guide de Migration : Mock vers API Réelle (KPI Stratégiques)

Ce guide détaille les étapes pour remplacer les données statiques (mock) par les appels API réels une fois le backend prêt.

## Prérequis

1. L'API backend doit être implémentée selon la spécification `KPI_STRATEGIC_API_SPEC.md`.
2. Le fichier `src/services/mock-kpi-strategic.ts` doit être présent (il contient les types TypeScript nécessaires).

---

## Étape 1 : Créer le service API

Créez un nouveau fichier `src/services/kpi-strategic-api.ts`.
Ce fichier gérera les appels HTTP vers le backend.

```typescript
// src/services/kpi-strategic-api.ts
import {
  GrandsComptesKPIs,
  PlugPlayKPIs,
  B2CKPIs,
  RecapKPIData,
} from "./mock-kpi-strategic";

// Remplacez par votre URL de base ou variable d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Fonction générique pour les appels API
 */
async function fetchKPI<T>(endpoint: string, filters?: any): Promise<T> {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `${API_BASE_URL}/kpi-strategic/${endpoint}?${queryParams}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      // Ajoutez votre token d'auth ici si nécessaire
      // 'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status}): ${response.statusText}`);
  }

  return response.json();
}

// --- Endpoints ---

export const fetchGrandsComptes = (filters: any) =>
  fetchKPI<GrandsComptesKPIs>("grands-comptes", filters);

export const fetchPlugPlay = (filters: any) =>
  fetchKPI<PlugPlayKPIs>("plug-play", filters);

export const fetchB2C = (filters: any) => fetchKPI<B2CKPIs>("b2c", filters);

export const fetchRecap = (filters: any) =>
  fetchKPI<RecapKPIData>("recap", filters);
```

---

## Étape 2 : Integration du Skeletton loader

Pour simplifier la gestion du chargement et des erreurs dans les composants.

```typescript
// src/hooks/useStrategicData.ts
import { useState, useEffect } from "react";
import { FilterState } from "@/types";

export function useStrategicData<T>(
  fetchFunction: (filters: FilterState) => Promise<T>,
  filters: FilterState,
  initialData: T, // On peut utiliser le mock comme valeur initiale/fallback
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchFunction(filters);
        if (isMounted) setData(result);
      } catch (err: any) {
        console.error("Erreur chargement KPI:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filters]); // Recharger quand les filtres changent

  return { data, isLoading, error };
}
```

---

## Étape 3 : Mettre à jour les Vues

Exemple pour `GrandsComptesView.tsx`. Le principe est le même pour `PlugPlayView`, `B2CView` et `RecapKpiView`.

### Avant (Code actuel avec Mock)

```typescript
import { MOCK_GRANDS_COMPTES } from "@/services/mock-kpi-strategic";

// ...

// Extract data from mock for easier access
const mockData = MOCK_GRANDS_COMPTES;

export function GrandsComptesView({ filters, isComparing }: GrandsComptesViewProps) {
  // ... utilisation directe de mockData ...
  return (
    // ... JSX ...
       value={`${(mockData.arr.current / 1000000).toFixed(2)}M€`}
    // ...
  );
}
```

### Après (Code avec API)

```typescript
import { MOCK_GRANDS_COMPTES } from "@/services/mock-kpi-strategic";
import { fetchGrandsComptes } from "@/services/kpi-strategic-api"; // Import du service
import { useStrategicData } from "@/hooks/useStrategicData"; // Import du hook (si créé)
import { Loader2 } from "lucide-react"; // Pour le loading state

// ...

export function GrandsComptesView({ filters, isComparing }: GrandsComptesViewProps) {

  // Utilisation du hook pour charger les données
  const { data: kpiData, isLoading, error } = useStrategicData(
    fetchGrandsComptes,
    filters,
    MOCK_GRANDS_COMPTES // Fallback sur le mock en attendant ou en cas d'erreur
  );

  // Gestion du loading (optionnel : afficher un squelette ou un spinner)
  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  // Si on veut bloquer sur erreur
  if (error) {
    return <div className="text-red-500">Erreur de chargement: {error}</div>;
  }

  // Remplacer 'mockData' par 'kpiData' dans tout le fichier
  // Astuce : Renommez simplement la variable pour ne pas toucher au JSX
  const mockData = kpiData;

  return (
    // ... Le reste du JSX reste IDENTIQUE car la structure de données est la même ! ...
       value={`${(mockData.arr.current / 1000000).toFixed(2)}M€`}
    // ...
  );
}
```

---

## Checklist de Migration

1. [ ] Backend déployé et accessible.
2. [ ] Token d'authentification configuré (si nécessaire).
3. [ ] `kpi-strategic-api.ts` créé.
4. [ ] `useStrategicData` hook créé (ou logique `useEffect` simple).
5. [ ] **GrandsComptesView** migré.
6. [ ] **PlugPlayView** migré.
7. [ ] **B2CView** migré.
8. [ ] **RecapKpiView** migré.
9. [ ] Vérification que les filtres (dates) sont bien passés à l'API.
10. [ ] Suppression (ou archivage) de `mock-kpi-strategic.ts` une fois tout validé.

---

## Points d'attention

- **Gestion des dates** : Assurez-vous que le format des dates envoyé par le frontend (dans `filters`) correspond à ce que le backend attend (ex : YYYY-MM-DD).
- **Performance** : `RecapKpiView` pourrait avoir besoin de charger les données des 3 segments. Il vaut mieux un endpoint dédié `/recap` qui aggrege tout côté backend (comme spécifié) plutôt que de faire 3 appels frontend.
- **Types** : Si le backend change la structure, mettez d'abord à jour les interfaces dans `mock-kpi-strategic.ts` (ou un nouveau fichier de types `types/kpi.ts`) pour que TypeScript vous signale les erreurs dans les vues.
