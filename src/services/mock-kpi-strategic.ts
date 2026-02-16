/**
 * MOCK DATA - KPI STRATÉGIQUE
 *
 * Ce fichier contient des données mock statiques pour les KPI Stratégiques
 * (Grands Comptes, Plug & Play, B2C, Récapitulatif KPI).
 *
 * Ces données sont utilisées temporairement en attendant que l'API backend soit finalisée.
 *
 * STRUCTURE À IMPLÉMENTER PAR LE BACKEND:
 * Les données ci-dessous représentent exactement la structure JSON que l'API devra retourner
 * pour une intégration facile.
 *
 * @module mock-kpi-strategic
 */

/**
 * ========================================
 * GRANDS COMPTES (GC) - MOCK DATA
 * ========================================
 */

export interface GrandsComptesKPIs {
  // KPIs principaux
  arr: {
    current: number;
    previous: number;
    trend: number;
    evolution: Array<{
      month: string;
      arr: number;
      variation: string;
      clients: number;
    }>;
  };
  tasses_mensuelles: {
    current: number;
    previous: number;
    trend: number;
    details: Array<{
      mois: string;
      tasses: number;
      sites: number;
      moyenneSite: number;
    }>;
  };
  adoption_interne: {
    current: number;
    previous: number;
    trend: number;
    par_client: Array<{
      client: string;
      collaborateurs: number;
      actifs: number;
      taux: string;
    }>;
  };
  marge_client: {
    current: number;
    previous: number;
    trend: number;
    details: Array<{
      client: string;
      ca: number;
      marge: number;
      tauxMarge: string;
    }>;
  };
  ococ_client: {
    current: number;
    previous: number;
    trend: number;
    details: Array<{
      client: string;
      tasses: number;
      ococ: number;
      arbres: number;
    }>;
  };
  // KPIs secondaires
  sites_actifs: {
    current: number;
    trend: number;
    par_region: Array<{
      region: string;
      sites: number;
      tasses: number;
    }>;
  };
  sla_respectes: {
    current: string;
    trend: number;
    details: Array<{
      type: string;
      total: number;
      respectes: number;
      taux: string;
    }>;
  };
  cycle_vente: {
    current: string;
    trend: number;
    pipeline: Array<{
      etape: string;
      deals: number;
      duree: string;
    }>;
  };
  etudes_cas: {
    current: number;
    trend: number;
    liste: Array<{
      client: string;
      secteur: string;
      date: string;
    }>;
  };
}

export const MOCK_GRANDS_COMPTES: GrandsComptesKPIs = {
  arr: {
    current: 2980000,
    previous: 2750000,
    trend: 8.2,
    evolution: [
      { month: "Janvier", arr: 2450000, variation: "+5.2%", clients: 42 },
      { month: "Février", arr: 2580000, variation: "+5.3%", clients: 43 },
      { month: "Mars", arr: 2670000, variation: "+3.5%", clients: 44 },
      { month: "Avril", arr: 2750000, variation: "+3.0%", clients: 45 },
      { month: "Mai", arr: 2890000, variation: "+5.1%", clients: 46 },
      { month: "Juin", arr: 2980000, variation: "+3.1%", clients: 47 },
    ],
  },
  tasses_mensuelles: {
    current: 178000,
    previous: 165000,
    trend: 5.9,
    details: [
      { mois: "Janvier", tasses: 162000, sites: 42, moyenneSite: 3857 },
      { mois: "Février", tasses: 165000, sites: 43, moyenneSite: 3837 },
      { mois: "Mars", tasses: 168000, sites: 44, moyenneSite: 3818 },
      { mois: "Avril", tasses: 172000, sites: 45, moyenneSite: 3822 },
      { mois: "Mai", tasses: 175000, sites: 46, moyenneSite: 3804 },
      { mois: "Juin", tasses: 178000, sites: 47, moyenneSite: 3787 },
    ],
  },
  adoption_interne: {
    current: 72,
    previous: 68,
    trend: 3.4,
    par_client: [
      { client: "Client A", collaborateurs: 1200, actifs: 936, taux: "78%" },
      { client: "Client B", collaborateurs: 800, actifs: 520, taux: "65%" },
      { client: "Client C", collaborateurs: 2500, actifs: 2300, taux: "92%" },
      { client: "Client D", collaborateurs: 450, actifs: 243, taux: "54%" },
      { client: "Client E", collaborateurs: 1800, actifs: 1584, taux: "88%" },
    ],
  },
  marge_client: {
    current: 34,
    previous: 33,
    trend: 1.2,
    details: [
      { client: "Client A", ca: 245000, marge: 83300, tauxMarge: "34%" },
      { client: "Client B", ca: 180000, marge: 59400, tauxMarge: "33%" },
      { client: "Client C", ca: 520000, marge: 182000, tauxMarge: "35%" },
      { client: "Client D", ca: 95000, marge: 30400, tauxMarge: "32%" },
      { client: "Client E", ca: 320000, marge: 112000, tauxMarge: "35%" },
    ],
  },
  ococ_client: {
    current: 842,
    previous: 748,
    trend: 12.5,
    details: [
      { client: "Client A", tasses: 28000, ococ: 280, arbres: 64 },
      { client: "Client B", tasses: 18500, ococ: 185, arbres: 42 },
      { client: "Client C", tasses: 52000, ococ: 520, arbres: 119 },
      { client: "Client D", tasses: 9200, ococ: 92, arbres: 21 },
      { client: "Client E", tasses: 34000, ococ: 340, arbres: 78 },
    ],
  },
  sites_actifs: {
    current: 47,
    trend: 4,
    par_region: [
      { region: "Île-de-France", sites: 18, tasses: 72000 },
      { region: "Auvergne-Rhône-Alpes", sites: 8, tasses: 28000 },
      { region: "PACA", sites: 6, tasses: 22000 },
      { region: "Hauts-de-France", sites: 5, tasses: 18000 },
      { region: "Autres", sites: 10, tasses: 38000 },
    ],
  },
  sla_respectes: {
    current: "94%",
    trend: 2.1,
    details: [
      {
        type: "Maintenance préventive",
        total: 120,
        respectes: 118,
        taux: "98%",
      },
      { type: "Dépannage urgent", total: 45, respectes: 40, taux: "89%" },
      { type: "Installation", total: 8, respectes: 8, taux: "100%" },
      { type: "Réassort", total: 180, respectes: 168, taux: "93%" },
    ],
  },
  cycle_vente: {
    current: "68 jours",
    trend: -12,
    pipeline: [
      { etape: "Lead qualifié", deals: 24, duree: "0 jours" },
      { etape: "Premier RDV", deals: 18, duree: "8 jours" },
      { etape: "Proposition", deals: 12, duree: "25 jours" },
      { etape: "Négociation", deals: 8, duree: "52 jours" },
      { etape: "Closing", deals: 5, duree: "68 jours" },
    ],
  },
  etudes_cas: {
    current: 12,
    trend: 20,
    liste: [
      { client: "TechCorp", secteur: "IT", date: "Jan 2024" },
      { client: "BankPlus", secteur: "Finance", date: "Fév 2024" },
      { client: "HealthFirst", secteur: "Santé", date: "Mar 2024" },
      { client: "RetailMax", secteur: "Distribution", date: "Avr 2024" },
    ],
  },
};

/**
 * ========================================
 * PLUG & PLAY (PP) - MOCK DATA
 * ========================================
 */

export interface PlugPlayKPIs {
  // KPIs principaux
  mrr: {
    current: number;
    previous: number;
    trend: number;
    evolution: Array<{
      mois: string;
      mrr: number;
      nouveaux: number;
      churns: number;
      net: number;
    }>;
  };
  churn_90j: {
    current: number;
    previous: number;
    trend: number;
    par_cohorte: Array<{
      cohorte: string;
      inscrits: number;
      actifs90j: number;
      churns: number;
      taux: string;
    }>;
  };
  arpa: {
    current: number;
    previous: number;
    trend: number;
    par_pack: Array<{
      pack: string;
      clients: number;
      arpa: number;
      part: string;
    }>;
  };
  cout_service_client: {
    current: number;
    previous: number;
    trend: number;
    par_type: Array<{
      type: string;
      tickets: number;
      coutMoyen: number;
      total: number;
    }>;
  };
  taux_activation: {
    current: number;
    previous: number;
    trend: number;
    par_semaine: Array<{
      semaine: string;
      inscrits: number;
      actives: number;
      taux: string;
    }>;
  };
  // KPIs secondaires
  abonnements_actifs: {
    current: number;
    trend: number;
    repartition: Array<{
      pack: string;
      actifs: number;
      part: string;
    }>;
  };
  tasses_client_mois: {
    current: number;
    trend: number;
    par_pack: Array<{
      pack: string;
      moyenne: number;
      incluses: number;
    }>;
  };
  delai_installation: {
    current: string;
    trend: number;
    par_region: Array<{
      region: string;
      delai: string;
      installations: number;
    }>;
  };
  taux_upsell: {
    current: string;
    trend: number;
    par_type: Array<{
      type: string;
      nombre: number;
      revenus: number;
    }>;
  };
}

export const MOCK_PLUG_PLAY: PlugPlayKPIs = {
  mrr: {
    current: 58000,
    previous: 52000,
    trend: 4.5,
    evolution: [
      { mois: "Janvier", mrr: 42000, nouveaux: 12, churns: 3, net: 9 },
      { mois: "Février", mrr: 45000, nouveaux: 15, churns: 4, net: 11 },
      { mois: "Mars", mrr: 48500, nouveaux: 18, churns: 5, net: 13 },
      { mois: "Avril", mrr: 52000, nouveaux: 20, churns: 4, net: 16 },
      { mois: "Mai", mrr: 55500, nouveaux: 22, churns: 6, net: 16 },
      { mois: "Juin", mrr: 58000, nouveaux: 18, churns: 5, net: 13 },
    ],
  },
  churn_90j: {
    current: 8,
    previous: 9.2,
    trend: -1.2,
    par_cohorte: [
      {
        cohorte: "Janvier",
        inscrits: 45,
        actifs90j: 42,
        churns: 3,
        taux: "6.7%",
      },
      {
        cohorte: "Février",
        inscrits: 52,
        actifs90j: 47,
        churns: 5,
        taux: "9.6%",
      },
      { cohorte: "Mars", inscrits: 58, actifs90j: 53, churns: 5, taux: "8.6%" },
      {
        cohorte: "Avril",
        inscrits: 61,
        actifs90j: 56,
        churns: 5,
        taux: "8.2%",
      },
    ],
  },
  arpa: {
    current: 245,
    previous: 236,
    trend: 3.8,
    par_pack: [
      { pack: "Starter", clients: 85, arpa: 195, part: "36%" },
      { pack: "Business", clients: 112, arpa: 265, part: "47%" },
      { pack: "Premium", clients: 40, arpa: 345, part: "17%" },
    ],
  },
  cout_service_client: {
    current: 18,
    previous: 19,
    trend: -5.2,
    par_type: [
      { type: "Installation", tickets: 45, coutMoyen: 85, total: 3825 },
      { type: "Support téléphone", tickets: 180, coutMoyen: 12, total: 2160 },
      { type: "Intervention site", tickets: 28, coutMoyen: 65, total: 1820 },
      { type: "Réassort express", tickets: 15, coutMoyen: 25, total: 375 },
    ],
  },
  taux_activation: {
    current: 87,
    previous: 84,
    trend: 6.4,
    par_semaine: [
      { semaine: "S1", inscrits: 15, actives: 12, taux: "80%" },
      { semaine: "S2", inscrits: 18, actives: 16, taux: "89%" },
      { semaine: "S3", inscrits: 22, actives: 20, taux: "91%" },
      { semaine: "S4", inscrits: 20, actives: 18, taux: "90%" },
    ],
  },
  abonnements_actifs: {
    current: 237,
    trend: 8.5,
    repartition: [
      { pack: "Starter", actifs: 85, part: "36%" },
      { pack: "Business", actifs: 112, part: "47%" },
      { pack: "Premium", actifs: 40, part: "17%" },
    ],
  },
  tasses_client_mois: {
    current: 420,
    trend: 3.2,
    par_pack: [
      { pack: "Starter", moyenne: 280, incluses: 300 },
      { pack: "Business", moyenne: 450, incluses: 500 },
      { pack: "Premium", moyenne: 680, incluses: 800 },
    ],
  },
  delai_installation: {
    current: "3.2 jours",
    trend: -15,
    par_region: [
      { region: "Île-de-France", delai: "2.5 jours", installations: 35 },
      { region: "Lyon/Marseille", delai: "3.0 jours", installations: 22 },
      { region: "Autres", delai: "4.2 jours", installations: 18 },
    ],
  },
  taux_upsell: {
    current: "24%",
    trend: 5.8,
    par_type: [
      { type: "Pack supérieur", nombre: 28, revenus: 1960 },
      { type: "Options machine", nombre: 15, revenus: 750 },
      { type: "Cafés premium", nombre: 42, revenus: 840 },
    ],
  },
};

/**
 * ========================================
 * B2C ABONNEMENTS - MOCK DATA
 * ========================================
 */

export interface B2CKPIs {
  // KPIs principaux
  mrr_abonnements: {
    current: number;
    previous: number;
    trend: number;
    evolution: Array<{
      mois: string;
      mrr: number;
      abonnes: number;
      panier: number;
    }>;
  };
  retention_6mois: {
    current: number;
    previous: number;
    trend: number;
    courbe: Array<{
      mois: string;
      cohorte: number;
      restants: number;
      taux: string;
    }>;
  };
  cac_vs_ltv: {
    current: string;
    previous: string;
    trend: number;
    par_segment: Array<{
      segment: string;
      cac: number;
      ltv: number;
      ratio: string;
    }>;
  };
  nps: {
    current: number;
    previous: number;
    trend: number;
    details: Array<{
      categorie: string;
      nombre: number;
      part: string;
    }>;
  };
  ococ_abonne: {
    current: number;
    previous: number;
    trend: number;
    evolution: Array<{
      mois: string;
      abonnes: number;
      ococ: number;
      arbres: number;
    }>;
  };
  // KPIs secondaires
  abonnes_actifs: {
    current: number;
    trend: number;
    par_formule: Array<{
      formule: string;
      abonnes: number;
      part: string;
    }>;
  };
  cac: {
    current: number;
    trend: number;
    par_canal: Array<{
      canal: string;
      acquisitions: number;
      cac: number;
    }>;
  };
  panier_moyen: {
    current: number;
    trend: number;
    par_formule: Array<{
      formule: string;
      panier: number;
      frequence: string;
    }>;
  };
  taux_parrainage: {
    current: string;
    trend: number;
    evolution: Array<{
      mois: string;
      parrains: number;
      filleuls: number;
      taux: string;
    }>;
  };
}

export const MOCK_B2C: B2CKPIs = {
  mrr_abonnements: {
    current: 29000,
    previous: 26000,
    trend: 5.5,
    evolution: [
      { mois: "Janvier", mrr: 18500, abonnes: 412, panier: 45 },
      { mois: "Février", mrr: 21000, abonnes: 468, panier: 45 },
      { mois: "Mars", mrr: 23500, abonnes: 525, panier: 45 },
      { mois: "Avril", mrr: 25000, abonnes: 580, panier: 43 },
      { mois: "Mai", mrr: 27500, abonnes: 642, panier: 43 },
      { mois: "Juin", mrr: 29000, abonnes: 690, panier: 42 },
    ],
  },
  retention_6mois: {
    current: 73,
    previous: 70,
    trend: 2.8,
    courbe: [
      { mois: "M1", cohorte: 500, restants: 500, taux: "100%" },
      { mois: "M2", cohorte: 500, restants: 460, taux: "92%" },
      { mois: "M3", cohorte: 500, restants: 425, taux: "85%" },
      { mois: "M4", cohorte: 500, restants: 400, taux: "80%" },
      { mois: "M5", cohorte: 500, restants: 380, taux: "76%" },
      { mois: "M6", cohorte: 500, restants: 365, taux: "73%" },
    ],
  },
  cac_vs_ltv: {
    current: "1:4.2",
    previous: "1:3.8",
    trend: 8.3,
    par_segment: [
      { segment: "Nouveaux (<3m)", cac: 32, ltv: 98, ratio: "1:3.1" },
      { segment: "Établis (3-12m)", cac: 28, ltv: 125, ratio: "1:4.5" },
      { segment: "Fidèles (>12m)", cac: 22, ltv: 185, ratio: "1:8.4" },
      { segment: "Moyenne", cac: 28, ltv: 118, ratio: "1:4.2" },
    ],
  },
  nps: {
    current: 62,
    previous: 58,
    trend: 5,
    details: [
      { categorie: "Promoteurs (9-10)", nombre: 485, part: "45%" },
      { categorie: "Passifs (7-8)", nombre: 387, part: "36%" },
      { categorie: "Détracteurs (0-6)", nombre: 204, part: "19%" },
      { categorie: "NPS Score", nombre: 62, part: "45-19=26pts" },
    ],
  },
  ococ_abonne: {
    current: 4.2,
    previous: 3.75,
    trend: 12.1,
    evolution: [
      { mois: "Janvier", abonnes: 412, ococ: 1730, arbres: 395 },
      { mois: "Février", abonnes: 468, ococ: 1965, arbres: 449 },
      { mois: "Mars", abonnes: 525, ococ: 2205, arbres: 504 },
      { mois: "Avril", abonnes: 580, ococ: 2436, arbres: 557 },
      { mois: "Mai", abonnes: 642, ococ: 2696, arbres: 616 },
      { mois: "Juin", abonnes: 690, ococ: 2898, arbres: 662 },
    ],
  },
  abonnes_actifs: {
    current: 1247,
    trend: 11.2,
    par_formule: [
      { formule: "Découverte", abonnes: 312, part: "25%" },
      { formule: "Classique", abonnes: 623, part: "50%" },
      { formule: "Premium", abonnes: 312, part: "25%" },
    ],
  },
  cac: {
    current: 28,
    trend: -8.5,
    par_canal: [
      { canal: "SEO/Organique", acquisitions: 145, cac: 12 },
      { canal: "Social Ads", acquisitions: 89, cac: 35 },
      { canal: "Parrainage", acquisitions: 67, cac: 18 },
      { canal: "Google Ads", acquisitions: 52, cac: 42 },
    ],
  },
  panier_moyen: {
    current: 42,
    trend: 3.2,
    par_formule: [
      { formule: "Découverte", panier: 28, frequence: "Mensuel" },
      { formule: "Classique", panier: 42, frequence: "Mensuel" },
      { formule: "Premium", panier: 65, frequence: "Bi-mensuel" },
    ],
  },
  taux_parrainage: {
    current: "18%",
    trend: 24,
    evolution: [
      { mois: "Avril", parrains: 85, filleuls: 12, taux: "14%" },
      { mois: "Mai", parrains: 102, filleuls: 18, taux: "18%" },
      { mois: "Juin", parrains: 118, filleuls: 21, taux: "18%" },
    ],
  },
};

/**
 * ========================================
 * RÉCAPITULATIF KPI STRATÉGIQUE - MOCK DATA
 * ========================================
 */

export interface RecapKPIData {
  // KPIs globaux consolidés
  ca_total_recurrent: {
    current: number;
    previous: number;
    trend: number;
    evolution: Array<{
      mois: string;
      gc: number;
      pp: number;
      b2c: number;
      total: number;
    }>;
  };
  clients_grands_comptes: {
    current: number;
    previous: number;
    trend: number;
  };
  clients_plug_play: {
    current: number;
    previous: number;
    trend: number;
  };
  abonnes_b2c: {
    current: number;
    previous: number;
    trend: number;
  };
  // Détails par segment
  segment_gc: {
    kpis: Array<{
      kpi: string;
      actuel: string;
      precedent: string;
      variation: string;
    }>;
  };
  segment_pp: {
    kpis: Array<{
      kpi: string;
      actuel: string;
      precedent: string;
      variation: string;
    }>;
  };
  segment_b2c: {
    kpis: Array<{
      kpi: string;
      actuel: string;
      precedent: string;
      variation: string;
    }>;
  };
}

export const MOCK_RECAP_KPI: RecapKPIData = {
  ca_total_recurrent: {
    current: 385000,
    previous: 358000,
    trend: 7.5,
    evolution: [
      { mois: "Janvier", gc: 248000, pp: 48000, b2c: 24000, total: 320000 },
      { mois: "Février", gc: 262000, pp: 52000, b2c: 26000, total: 340000 },
      { mois: "Mars", gc: 272000, pp: 54500, b2c: 27500, total: 354000 },
      { mois: "Avril", gc: 280000, pp: 56000, b2c: 28000, total: 364000 },
      { mois: "Mai", gc: 290000, pp: 57000, b2c: 28500, total: 375500 },
      { mois: "Juin", gc: 298000, pp: 58000, b2c: 29000, total: 385000 },
    ],
  },
  clients_grands_comptes: {
    current: 47,
    previous: 42,
    trend: 11.9,
  },
  clients_plug_play: {
    current: 237,
    previous: 198,
    trend: 19.7,
  },
  abonnes_b2c: {
    current: 1247,
    previous: 1089,
    trend: 14.5,
  },
  segment_gc: {
    kpis: [
      { kpi: "ARR", actuel: "2,98M€", precedent: "2,75M€", variation: "+8.2%" },
      {
        kpi: "Clients actifs",
        actuel: "47",
        precedent: "42",
        variation: "+11.9%",
      },
      {
        kpi: "Adoption interne",
        actuel: "72%",
        precedent: "68%",
        variation: "+4pts",
      },
      {
        kpi: "CA moyen/client",
        actuel: "63k€",
        precedent: "65k€",
        variation: "-3.1%",
      },
    ],
  },
  segment_pp: {
    kpis: [
      { kpi: "MRR", actuel: "58k€", precedent: "52k€", variation: "+11.5%" },
      {
        kpi: "Clients actifs",
        actuel: "237",
        precedent: "198",
        variation: "+19.7%",
      },
      {
        kpi: "Churn 90j",
        actuel: "8%",
        precedent: "9.2%",
        variation: "-1.2pts",
      },
      {
        kpi: "Activation J30",
        actuel: "87%",
        precedent: "84%",
        variation: "+3pts",
      },
    ],
  },
  segment_b2c: {
    kpis: [
      { kpi: "MRR", actuel: "29k€", precedent: "26k€", variation: "+11.5%" },
      {
        kpi: "Abonnés actifs",
        actuel: "1,247",
        precedent: "1,089",
        variation: "+14.5%",
      },
      {
        kpi: "Rétention 6m",
        actuel: "73%",
        precedent: "70%",
        variation: "+3pts",
      },
      { kpi: "NPS", actuel: "62", precedent: "58", variation: "+4pts" },
    ],
  },
};
