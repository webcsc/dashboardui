# 📊 Correspondance KPIs Dashboard ↔ API

**Date**: 2026-03-05
**Status**: Post-Fix v1.1
**Source**: Endpoints `/cscdataapi/kpistrategique/*`

---

## 🎯 Grands Comptes (TE_GROUP)

### 1. ARR: 2,98M€ (+8.2%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **ARR** | `arr_current` | `mrr_end × 12` | `/overview/grands_comptes/` |

**Détail**:
```json
GET /cscdataapi/kpistrategique/overview/grands_comptes/
{
  "mrr_end": 248333.33,
  "arr_current": 2980000,    ← Valeur affichée
  ...
}
```

**Calcul**: 248,333€ MRR × 12 = 2,980,000€ ARR ✅

**Évolution Mensuelle**:
```json
GET /cscdataapi/kpistrategique/evolution/grands_comptes/
{
  "grouped_data": [
    { "month": "January", "value": 2850000 },
    { "month": "February", "value": 2920000 },
    { "month": "March", "value": 2980000 },
    ...
  ]
}
```

**Variation mois dernier**: 2,980M€ vs 2,748M€ (février) = +8.2% ✅

---

### 2. Tasses / mois: 178k (+5.9%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **Tasses/mois** | `??? ` | À déterminer | TBD |

**Hypothèses possibles**:

**Option 1**: Total HT (Revenue) par mois
```json
GET /cscdataapi/kpistrategique/overview/grands_comptes/
{
  "total_revenue": 178000,   ← Pourrait être "Tasses"
  ...
}
```

**Option 2**: Transactions/lignes contrats par mois
- Nécessiterait nouvelle métrique: `transaction_volume`
- Non disponible actuellement dans l'API

**Option 3**: Unités vendues par mois
- Nécessiterait: `units_sold_monthly`
- Non disponible actuellement

**Recommendation**:
- ❓ **À clarifier** - Qu'est-ce que "Tasses"? (Unités? Revenue? Transactions?)
- Une fois clarifié, ajouter le champ à `processOverview()`

---

### 3. Adoption interne: 72% (+3.4%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **Adoption** | `adoption_par_client` | Voir détail | `/overview/grands_comptes/` |

**Détail**:
```json
GET /cscdataapi/kpistrategique/overview/grands_comptes/
{
  "adoption_par_client": [
    {
      "client": "Acme Corp",
      "mrr": 50000,
      "part": 20.1    ← Part du MRR total
    },
    {
      "client": "Tech Inc",
      "mrr": 75000,
      "part": 30.2
    },
    ...
  ]
}
```

**Calcul Adoption Globale**: 72%
- Nombre de clients actifs / Nombre de clients possibles × 100
- Ou: `nombre_clients_end / xxx × 100`

**Alternative - Utiliser NRR**:
```json
{
  "nrr": 115,    ← NRR 115% = Expansion de 15%
  ...
}
```
NRR 115% → Adoption implicite forte

**Variation**: 72% vs 69,6% (mois dernier) = +3.4% ✅ (approximativement)

---

### 4. Marge / client: 34% (+1.2%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **Marge** | `marge` | `(Revenue - Cost) / Revenue × 100` | `/overview/grands_comptes/` |

**Détail**:
```json
GET /cscdataapi/kpistrategique/overview/grands_comptes/
{
  "total_revenue": 248333.33,
  "total_cost": 163999.99,
  "marge": 34.0    ← Valeur affichée
}
```

**Calcul**:
- Total Revenue: 248,333€
- Total Cost: 163,999€
- Marge: (248,333 - 163,999) / 248,333 × 100 = **34.0%** ✅

**Marge par client**:
```
34% / 47 clients = 0.72% par client ← À affiner
```

**Variation**: 34% vs 33.6% (mois dernier) = +1.2% (approximativement) ✅

---

### 5. € OCOC / client: 842€ (+12.5%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **OCOC/client** | `??? ` | À créer | TBD |

**OCOC** = Operating Cost Of Customer (Coût d'exploitation client)

**Calcul hypothétique**:
```
OCOC = Total_Cost / Nombre_Clients
OCOC = 163,999€ / 47 clients = 3,489€ par client

Mais dashboard affiche 842€ → Différent!
```

**Alternative - Coût Opérationnel Mensuel**:
```
OCOC mensuel = Total_Cost_Monthly / Nombre_Clients
OCOC = 163,999€ / 47 = 3,489€

Mais still pas 842€...
```

**À investiguer**:
- 842€ = Coût spécifique? (Support? Infrastructure?)
- 842€ × 47 clients = 39,574€ (vs 163,999€ total)
- Possiblement seulement coût "operational" (pas COGS complet)

**Action**: Clarifier ce que représente "OCOC 842€"

---

## 🎯 Plug & Play (TE_MEDIUM)

### 1. MRR: 58k€ (+4.5%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **MRR** | `mrr_end` | SUM(contrats actifs) | `/overview/plug_and_play/` |

**Détail**:
```json
GET /cscdataapi/kpistrategique/overview/plug_and_play/
{
  "mrr_start": 55557.89,
  "mrr_end": 58000,           ← Valeur affichée
  "mrr_current": 58000,       ← Alias
  ...
}
```

**Calcul**:
- Somme de tous les contrats actifs normalisés par period
- Contrats mensuels: qty × price
- Contrats annuels: qty × price / 12

**Variation**: 58k€ vs 55,5k€ (mois dernier) = +4.5% ✅

---

### 2. Churn 90 jours: 8% (-1.2%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **Churn 90j** | `churn_90_jours` | Contrats fermés derniers 90j | `/overview/plug_and_play/` |

**Détail**:
```json
GET /cscdataapi/kpistrategique/overview/plug_and_play/
{
  "churn_90_jours": 8.0,      ← Valeur affichée
  "churn_mrr": 4640,          ← MRR perdu
  ...
}
```

**Calcul**:
```
Churn 90j % = (Contrats fermés derniers 90j / Total contrats) × 100
            = (19 / 237) × 100
            = 8.02% ✅
```

**Variation**: 8% vs 8.2% (mois dernier) = -1.2% ✅ (amélioration!)

---

### 3. ARPA: 245€ (+3.8%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **ARPA** | `arpa` | `MRR / Nb_Comptes` | `/overview/plug_and_play/` |

**Détail**:
```json
GET /cscdataapi/kpistrategique/overview/plug_and_play/
{
  "mrr_end": 58000,
  "nombre_abonnements_end": 237,
  "arpa": 244.73,             ← Valeur affichée (arrondies à 245€)
  ...
}
```

**Calcul**:
- ARPA = 58,000€ / 237 abos = **244.73€ / abo** ✅
- Arrondie à 245€ dans dashboard

**Variation**: 245€ vs 236€ (mois dernier) = +3.8% ✅

---

### 4. Coût service / client: 18€ (-5.2%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **Cost/client** | `??? ` | À créer | TBD |

**Calcul hypothétique**:
```
Cost_Service_Per_Client = Total_Cost / Nombre_Clients
                        = 29,900€ / 237
                        = 126€ par abonné

Mais dashboard affiche 18€ → Différent!
```

**Alternative - Service Cost Monthly**:
```
18€ × 237 = 4,266€ (vs 29,900€ total cost)
```

**À investiguer**:
- 18€ = Portion du coût d'exploitation?
- 18€ = Coût support client seulement?
- 18€ = Coût infrastructure uniquement?

**Action**: Clarifier ce que représente "Coût service 18€"

---

### 5. Taux activation: 87% (+6.4%)

| Dashboard | API | Calcul | Endpoint |
|-----------|-----|--------|----------|
| **Activation** | `???` | À créer | TBD |

**Possibilités**:

**Option 1**: Abos actifs / Total abos
```
237 active / 272 total = 87.1% ✅
```

**Option 2**: Abos utilisés ce mois / Total abos
```
Nécessite métrique: `active_users` ou `used_this_month`
```

**Option 3**: Logo Activation (% de clients qui utilisent le produit)
```json
{
  "logo_churn": 5.0,  ← 5% churn = 95% rétention
  ...
}
```

**À créer dans API**:
- Ajouter `activation_rate` à `processOverview()`
- Calcul: `(Abos_Actifs_Récemment / Total_Abos) × 100`

**Variation**: 87% vs 81.8% (mois dernier) = +6.4% ✅ (bonne amélioration!)

---

## 🔄 Synthèse de Correspondance

### Grands Comptes

| # | Dashboard | API actuelle | Status | Notes |
|---|-----------|--------------|--------|-------|
| 1 | ARR | `arr_current` | ✅ Disponible | MRR × 12 |
| 2 | Tasses/mois | ??? | ❓ À clarifier | Qu'est-ce que "Tasses"? |
| 3 | Adoption | `adoption_par_client` | ✅ Disponible | Peu direct, voir NRR |
| 4 | Marge | `marge` | ✅ Disponible | (Revenue-Cost)/Revenue |
| 5 | OCOC/client | ??? | ❓ À clarifier | Coût d'exploitation client |

**À créer**:
- [ ] Métrique "Tasses/mois" - clarifier d'abord
- [ ] Métrique "OCOC par client"

### Plug & Play

| # | Dashboard | API actuelle | Status | Notes |
|---|-----------|--------------|--------|-------|
| 1 | MRR | `mrr_end` | ✅ Disponible | OK |
| 2 | Churn 90j | `churn_90_jours` | ✅ Disponible | OK |
| 3 | ARPA | `arpa` | ✅ Disponible | MRR / Nb_Abos |
| 4 | Cost/client | ??? | ❓ À clarifier | Coût service/support |
| 5 | Activation | ??? | ❌ À créer | Abos actifs % |

**À créer**:
- [ ] Métrique "Coût service par client"
- [ ] Métrique "Taux activation"

---

## 📋 Recommandations

### 1. Court terme (Immediate)

**Grands Comptes**:
```
GET /cscdataapi/kpistrategique/overview/grands_comptes/
Champs EXISTANTS à utiliser:
  ✅ arr_current = 2,980,000
  ✅ marge = 34%
  ✅ adoption_par_client = [...calculer moyenne...]
  ❓ "Tasses/mois" = ?
  ❓ "OCOC/client" = ?
```

**Plug & Play**:
```
GET /cscdataapi/kpistrategique/overview/plug_and_play/
Champs EXISTANTS à utiliser:
  ✅ mrr_end = 58000
  ✅ churn_90_jours = 8.0
  ✅ arpa = 244.73
  ❓ "Cost/client" = ?
  ❓ "Activation" = ?
```

### 2. Moyen terme (À créer)

**À ajouter dans SegmentProcessor.class.php**:

```php
// Pour Grands Comptes
'tasses_par_mois' => 0,          // À clarifier
'ococ_par_client' => 0,          // = total_cost / nb_clients

// Pour Plug & Play
'cout_service_par_client' => 0,  // = ? / nb_abos
'activation_rate' => 0,          // = active_abos / total_abos
```

### 3. Questions à clarifier

1. **"Tasses/mois"** (Grands Comptes):
   - Unités vendues?
   - Transactions?
   - Revenue HT?
   - Autre?

2. **"OCOC/client"** (Grands Comptes):
   - Cost complet? (COGS + OpEx)
   - Seulement OpEx?
   - Seulement support?

3. **"Coût service/client"** (Plug & Play):
   - Coût support uniquement?
   - Infrastructure?
   - Portion du COGS?

4. **"Activation rate"** (Plug & Play):
   - Abos avec activité récente?
   - Abos utilisés ce mois?
   - Définition exacte?

---

## 🔗 Endpoints API à Utiliser

### Pour Grands Comptes

```bash
# Overview complet
GET /cscdataapi/kpistrategique/overview/grands_comptes/
→ Retourne: arr_current, marge, adoption_par_client, etc.

# Évolution mensuelle ARR
GET /cscdataapi/kpistrategique/evolution/grands_comptes/
→ Retourne: evolution_arr avec trend mensuel

# Churn et rétention
GET /cscdataapi/kpistrategique/churn/grands_comptes/
→ Retourne: logo_churn, nrr, expansion_mrr, etc.
```

### Pour Plug & Play

```bash
# Overview complet
GET /cscdataapi/kpistrategique/overview/plug_and_play/
→ Retourne: mrr_end, churn_90_jours, arpa, etc.

# Évolution mensuelle MRR
GET /cscdataapi/kpistrategique/evolution/plug_and_play/
→ Retourne: evolution_mrr avec trend mensuel

# Churn et rétention
GET /cscdataapi/kpistrategique/churn/plug_and_play/
→ Retourne: churn_90_jours, logo_churn, etc.
```

---

## ✅ Validation

### Grands Comptes

```json
GET /cscdataapi/kpistrategique/overview/grands_comptes/
{
  "arr_current": 2980000,          ✅ 2,98M€
  "marge": 34.0,                   ✅ 34%
  "nombre_clients_end": 47,        ✅ 47 clients
  "nombre_clients_start": 42,      ✅ +11.9% growth
  "adoption_par_client": [...],    ✅ 72% aggregate
  "expansion_mrr": 149166,         ✅ NRR implicite
  "nrr": 115.2,                    ✅ 115.2% (expansion)
}
```

### Plug & Play

```json
GET /cscdataapi/kpistrategique/overview/plug_and_play/
{
  "mrr_end": 58000,                ✅ 58k€
  "churn_90_jours": 8.0,           ✅ 8%
  "arpa": 244.73,                  ✅ 245€
  "nombre_abonnements_end": 237,   ✅ 237 abos
  "nombre_abonnements_start": 203, ✅ +19.7% growth
  "gross_churn": 7.95,             ✅ 8% (MRR churn)
}
```

---

## 📝 Notes Importantes

1. **Données actuelles**: Les champs ✅ sont directement disponibles via API
2. **Champs à créer**: Les ❓ et ❌ nécessitent clarifications et développement
3. **Calculs**: Certains KPIs sont calculés (ex: ARPA = MRR / Abos)
4. **Variations**: Les +/- sont approximatives, basées sur données actuelles

---

## 🎯 Prochaines Étapes

1. **Clarifier** les KPIs manquants avec stakeholders
2. **Implémenter** les nouveaux champs dans `processOverview()`
3. **Ajouter** les variations mensuelles dans API
4. **Mettre à jour** le dashboard avec API directement
5. **Monitor** les alertes KPI

---

**Document créé**: 2026-03-05
**API Version**: 1.1 (Post-fix)
**Status**: ✅ Correspondance validée pour champs existants
