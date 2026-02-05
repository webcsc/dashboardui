# Services CSC Dashboard

Services pour les appels API et la logique métier.

## dashboard-api.ts

Service principal pour charger les données du dashboard.

### fetchDashboardData

Fonction principale pour récupérer les données d'une vue.

**Features:**

- **Mode Dev** : Retourne des données mock avec latence simulée
- **Mode Prod** : Appels API réels vers `/api/dashboard`
- **Sécurité** : Validation des entrées, sanitisation
- **Error Handling** : Gestion 401, 403, 404 avec messages clairs
- **CSRF Protection** : Support pour tokens CSRF (décommenter si besoin)

**Usage:**

```typescript
import { fetchDashboardData } from '@/services/dashboard-api';

const data = await fetchDashboardData('cafe', filters);
```

### Données Mock

Les données mock sont définies dans `MOCK_DATA` pour faciliter le développement sans backend.

Pour ajouter une nouvelle vue :

```typescript
const MOCK_DATA = {
  cafe: { /* ... */ },
  nouvelleVue: {
    // Vos données mock
  },
};
```

### Migration vers API Réelle

Lors du passage en production, l'API `/api/dashboard` doit :

1. Accepter POST avec `{ view, filters }`
2. Valider les paramètres côté serveur
3. Retourner JSON avec les données
4. Gérer les erreurs avec codes HTTP appropriés

## Sécurité

**Important** : Les filtres utilisateur sont sanitisés avant envoi API pour éviter les injections.

Les dates sont converties en ISO string pour transmission sécurisée.
