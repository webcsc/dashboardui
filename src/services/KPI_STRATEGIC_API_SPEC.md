# Spécification API - KPI Stratégique

## Vue d'ensemble

Ce document décrit la structure des données JSON que l'API backend doit retourner pour les KPI Stratégiques (Grands Comptes, Plug & Play, B2C, Récapitulatif KPI).

Les données mock correspondantes sont disponibles dans le fichier `mock-kpi-strategic.ts` pour référence et pour faciliter l'intégration.

---

## Endpoints à implémenter

### 1. Grands Comptes (GC)

**Endpoint:** `GET /api/kpi-strategic/grands-comptes`

**Query Parameters:**

- `date_start` (string, format: YYYY-MM-DD)
- `date_end` (string, format: YYYY-MM-DD)
- `socids` (string, optionnel) - ID du client B2B
- `segments` (string, optionnel) - Liste des segments, séparés par des virgules
- `regions` (string, optionnel) - Liste des régions, séparées par des virgules
- `client_types` (string, optionnel) - Liste des types de clients, séparés par des virgules

**Réponse attendue:**

```json
{
  "arr": {
    "current": 2980000,
    "previous": 2750000,
    "trend": 8.2,
    "evolution": [
      {
        "month": "Janvier",
        "arr": 2450000,
        "variation": "+5.2%",
        "clients": 42
      }
      // ... autres mois
    ]
  },
  "tasses_mensuelles": {
    "current": 178000,
    "previous": 165000,
    "trend": 5.9,
    "details": [
      {
        "mois": "Janvier",
        "tasses": 162000,
        "sites": 42,
        "moyenneSite": 3857
      }
      // ... autres mois
    ]
  },
  "adoption_interne": {
    "current": 72,
    "previous": 68,
    "trend": 3.4,
    "par_client": [
      {
        "client": "Client A",
        "collaborateurs": 1200,
        "actifs": 936,
        "taux": "78%"
      }
      // ... autres clients
    ]
  },
  "marge_client": {
    "current": 34,
    "previous": 33,
    "trend": 1.2,
    "details": [
      {
        "client": "Client A",
        "ca": 245000,
        "marge": 83300,
        "tauxMarge": "34%"
      }
      // ... autres clients
    ]
  },
  "ococ_client": {
    "current": 842,
    "previous": 748,
    "trend": 12.5,
    "details": [
      {
        "client": "Client A",
        "tasses": 28000,
        "ococ": 280,
        "arbres": 64
      }
      // ... autres clients
    ]
  },
  "sites_actifs": {
    "current": 47,
    "trend": 4,
    "par_region": [
      {
        "region": "Île-de-France",
        "sites": 18,
        "tasses": 72000
      }
      // ... autres régions
    ]
  },
  "sla_respectes": {
    "current": "94%",
    "trend": 2.1,
    "details": [
      {
        "type": "Maintenance préventive",
        "total": 120,
        "respectes": 118,
        "taux": "98%"
      }
      // ... autres types
    ]
  },
  "cycle_vente": {
    "current": "68 jours",
    "trend": -12,
    "pipeline": [
      {
        "etape": "Lead qualifié",
        "deals": 24,
        "duree": "0 jours"
      }
      // ... autres étapes
    ]
  },
  "etudes_cas": {
    "current": 12,
    "trend": 20,
    "liste": [
      {
        "client": "TechCorp",
        "secteur": "IT",
        "date": "Jan 2024"
      }
      // ... autres études de cas
    ]
  }
}
```

---

### 2. Plug & Play (PP)

**Endpoint:** `GET /api/kpi-strategic/plug-play`

**Query Parameters:** (identiques à GC)

**Réponse attendue:**

```json
{
  "mrr": {
    "current": 58000,
    "previous": 52000,
    "trend": 4.5,
    "evolution": [
      {
        "mois": "Janvier",
        "mrr": 42000,
        "nouveaux": 12,
        "churns": 3,
        "net": 9
      }
      // ... autres mois
    ]
  },
  "churn_90j": {
    "current": 8,
    "previous": 9.2,
    "trend": -1.2,
    "par_cohorte": [
      {
        "cohorte": "Janvier",
        "inscrits": 45,
        "actifs90j": 42,
        "churns": 3,
        "taux": "6.7%"
      }
      // ... autres cohortes
    ]
  },
  "arpa": {
    "current": 245,
    "previous": 236,
    "trend": 3.8,
    "par_pack": [
      {
        "pack": "Starter",
        "clients": 85,
        "arpa": 195,
        "part": "36%"
      }
      // ... autres packs
    ]
  },
  "cout_service_client": {
    "current": 18,
    "previous": 19,
    "trend": -5.2,
    "par_type": [
      {
        "type": "Installation",
        "tickets": 45,
        "coutMoyen": 85,
        "total": 3825
      }
      // ... autres types
    ]
  },
  "taux_activation": {
    "current": 87,
    "previous": 84,
    "trend": 6.4,
    "par_semaine": [
      {
        "semaine": "S1",
        "inscrits": 15,
        "actives": 12,
        "taux": "80%"
      }
      // ... autres semaines
    ]
  },
  "abonnements_actifs": {
    "current": 237,
    "trend": 8.5,
    "repartition": [
      {
        "pack": "Starter",
        "actifs": 85,
        "part": "36%"
      }
      // ... autres packs
    ]
  },
  "tasses_client_mois": {
    "current": 420,
    "trend": 3.2,
    "par_pack": [
      {
        "pack": "Starter",
        "moyenne": 280,
        "incluses": 300
      }
      // ... autres packs
    ]
  },
  "delai_installation": {
    "current": "3.2 jours",
    "trend": -15,
    "par_region": [
      {
        "region": "Île-de-France",
        "delai": "2.5 jours",
        "installations": 35
      }
      // ... autres régions
    ]
  },
  "taux_upsell": {
    "current": "24%",
    "trend": 5.8,
    "par_type": [
      {
        "type": "Pack supérieur",
        "nombre": 28,
        "revenus": 1960
      }
      // ... autres types
    ]
  }
}
```

---

### 3. B2C Abonnements

**Endpoint:** `GET /api/kpi-strategic/b2c`

**Query Parameters:** (identiques à GC)

**Réponse attendue:**

```json
{
  "mrr_abonnements": {
    "current": 29000,
    "previous": 26000,
    "trend": 5.5,
    "evolution": [
      {
        "mois": "Janvier",
        "mrr": 18500,
        "abonnes": 412,
        "panier": 45
      }
      // ... autres mois
    ]
  },
  "retention_6mois": {
    "current": 73,
    "previous": 70,
    "trend": 2.8,
    "courbe": [
      {
        "mois": "M1",
        "cohorte": 500,
        "restants": 500,
        "taux": "100%"
      }
      // ... autres mois
    ]
  },
  "cac_vs_ltv": {
    "current": "1:4.2",
    "previous": "1:3.8",
    "trend": 8.3,
    "par_segment": [
      {
        "segment": "Nouveaux (<3m)",
        "cac": 32,
        "ltv": 98,
        "ratio": "1:3.1"
      }
      // ... autres segments
    ]
  },
  "nps": {
    "current": 62,
    "previous": 58,
    "trend": 5,
    "details": [
      {
        "categorie": "Promoteurs (9-10)",
        "nombre": 485,
        "part": "45%"
      }
      // ... autres catégories
    ]
  },
  "ococ_abonne": {
    "current": 4.2,
    "previous": 3.75,
    "trend": 12.1,
    "evolution": [
      {
        "mois": "Janvier",
        "abonnes": 412,
        "ococ": 1730,
        "arbres": 395
      }
      // ... autres mois
    ]
  },
  "abonnes_actifs": {
    "current": 1247,
    "trend": 11.2,
    "par_formule": [
      {
        "formule": "Découverte",
        "abonnes": 312,
        "part": "25%"
      }
      // ... autres formules
    ]
  },
  "cac": {
    "current": 28,
    "trend": -8.5,
    "par_canal": [
      {
        "canal": "SEO/Organique",
        "acquisitions": 145,
        "cac": 12
      }
      // ... autres canaux
    ]
  },
  "panier_moyen": {
    "current": 42,
    "trend": 3.2,
    "par_formule": [
      {
        "formule": "Découverte",
        "panier": 28,
        "frequence": "Mensuel"
      }
      // ... autres formules
    ]
  },
  "taux_parrainage": {
    "current": "18%",
    "trend": 24,
    "evolution": [
      {
        "mois": "Avril",
        "parrains": 85,
        "filleuls": 12,
        "taux": "14%"
      }
      // ... autres mois
    ]
  }
}
```

---

### 4. Récapitulatif KPI Stratégique

**Endpoint:** `GET /api/kpi-strategic/recap`

**Query Parameters:** (identiques à GC)

**Réponse attendue:**

```json
{
  "ca_total_recurrent": {
    "current": 385000,
    "previous": 358000,
    "trend": 7.5,
    "evolution": [
      {
        "mois": "Janvier",
        "gc": 248000,
        "pp": 48000,
        "b2c": 24000,
        "total": 320000
      }
      // ... autres mois
    ]
  },
  "clients_grands_comptes": {
    "current": 47,
    "previous": 42,
    "trend": 11.9
  },
  "clients_plug_play": {
    "current": 237,
    "previous": 198,
    "trend": 19.7
  },
  "abonnes_b2c": {
    "current": 1247,
    "previous": 1089,
    "trend": 14.5
  },
  "segment_gc": {
    "kpis": [
      {
        "kpi": "ARR",
        "actuel": "2,98M€",
        "precedent": "2,75M€",
        "variation": "+8.2%"
      }
      // ... autres KPIs GC
    ]
  },
  "segment_pp": {
    "kpis": [
      {
        "kpi": "MRR",
        "actuel": "58k€",
        "precedent": "52k€",
        "variation": "+11.5%"
      }
      // ... autres KPIs PP
    ]
  },
  "segment_b2c": {
    "kpis": [
      {
        "kpi": "MRR",
        "actuel": "29k€",
        "precedent": "26k€",
        "variation": "+11.5%"
      }
      // ... autres KPIs B2C
    ]
  }
}
```

---

## Notes importantes

### Types de données

- **Numbers:** Tous les montants (`arr`, `mrr`, `ca`, etc.) doivent être en **nombres entiers** (pas de formatage monétaire dans le JSON)
- **Trend:** Pourcentage de variation, nombre décimal positif ou négatif
- **Dates:** Format YYYY-MM-DD pour les query parameters
- **Strings:** Pour les taux en pourcentage formatés (ex: "78%", "1:4.2")

### Calculs de tendance (trend)

```
trend = ((current - previous) / previous) * 100
```

- **Positif** : amélioration (croissance CA, hausse adoption, etc.)
- **Négatif** : dégradation ou amélioration dans certains cas (ex: baisse du churn = positif)

### Filtres

Les mêmes filtres doivent être supportés par tous les endpoints :

- **date_start / date_end** : période d'analyse
- **socids** : filtre par client B2B spécifique
- **segments** : filtre par segment commercial
- **regions** : filtre par région géographique
- **client_types** : filtre par type de client (B2B, B2C, etc.)

### Données de comparaison

Pour chaque KPI principal:

- `current` : valeur actuelle (période sélectionnée)
- `previous` : valeur de la période précédente (même durée, décalée)
- `trend` : % de variation

---

## Migration des données mock vers l'API

Une fois l'API prête:

1. Remplacer les imports dans les vues:

   ```typescript
   // Avant
   import { MOCK_GRANDS_COMPTES } from "@/services/mock-kpi-strategic";

   // Après
   import { fetchGrandsComptesKPIs } from "@/services/kpi-strategic-api";
   ```

2. Les interfaces TypeScript définies dans `mock-kpi-strategic.ts` peuvent être réutilisées directement

3. Le frontend s'attend à recevoir exactement la même structure de données

---

## Checklist d'implémentation

- [ ] Endpoint `/api/kpi-strategic/grands-comptes`
- [ ] Endpoint `/api/kpi-strategic/plug-play`
- [ ] Endpoint `/api/kpi-strategic/b2c`
- [ ] Endpoint `/api/kpi-strategic/recap`
- [ ] Support des query parameters (filtres)
- [ ] Calcul des trends
- [ ] Calcul des données de comparaison (previous)
- [ ] Validation des dates
- [ ] Gestion des erreurs (404, 500, etc.)
- [ ] Documentation API (Swagger/OpenAPI)
- [ ] Tests unitaires
- [ ] Tests d'intégration

---
