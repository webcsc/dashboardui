import type { FilterState } from "@/types";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

import type { B2CKPIs } from "./mock-kpi-strategic";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "";

export type KpiStrategiqueSegment = "grands_comptes" | "plug_and_play" | "b2c";

export interface GCEvolutionArrItem {
  month: string;
  arr: number;
  clients: number;
}

export interface GCAdoptionParClientItem {
  [key: string]: string | number;
  client: string;
  collaborateurs: number;
  actifs: number;
  taux: string;
}

export interface GCMargeDetailItem {
  [key: string]: string | number;
  client: string;
  ca: number;
  marge: number;
  tauxMarge: string;
}

export interface KpiStrategiqueOverviewGrandsComptesData {
  clients: {
    count: number;
    trend: number;
  };
  arr: {
    evolution: GCEvolutionArrItem[];
  };
  adoption_interne: {
    par_client: GCAdoptionParClientItem[];
  };
  marge_client: {
    details: GCMargeDetailItem[];
  };
  ococ_client: {
    valeur: number;
    details: unknown[];
  };
  contrats: {
    nombre_abonnements_cours: number;
    etude_cas: number;
  };
}

export interface KpiStrategiqueOverviewGrandsComptesResponse {
  tiers: unknown[];
  segment: "grands_comptes";
  data: KpiStrategiqueOverviewGrandsComptesData;
}

// ── Plug & Play ──

export interface PPMrrEvolutionItem {
  [key: string]: string | number;
  mois: string;
  mrr: number;
  nouveaux: number;
  churns: number;
  net: number;
}

export interface PPChurnCohorteItem {
  [key: string]: string | number;
}

export interface PPArpaPackItem {
  [key: string]: string | number;
}

export interface KpiStrategiqueOverviewPlugPlayData {
  clients: {
    count: number;
    trend: number;
  };
  mrr: {
    evolution: PPMrrEvolutionItem[];
  };
  churn_90j: {
    valeur: number;
    par_cohorte: PPChurnCohorteItem[];
  };
  arpa: {
    valeur: number;
    par_pack: PPArpaPackItem[];
  };
  abonnements: {
    nombre_actif: number;
    upsell: number;
  };
}

export interface KpiStrategiqueOverviewPlugPlayResponse {
  tiers: unknown[];
  segment: "plug_and_play";
  data: KpiStrategiqueOverviewPlugPlayData;
}

export type KpiStrategiqueOverviewBySegment = {
  grands_comptes: KpiStrategiqueOverviewGrandsComptesResponse;
  plug_and_play: KpiStrategiqueOverviewPlugPlayResponse;
  b2c: B2CKPIs;
};

// ── Evolution (commun GC / PP / B2C) ──

export interface KpiStrategiqueEvolutionItem {
  [key: string]: string | number;
  month: string;
  value: number;
  clients_count: number;
}

export interface KpiStrategiqueEvolutionResponse {
  tiers: unknown[];
  segment: KpiStrategiqueSegment;
  data: KpiStrategiqueEvolutionItem[];
}

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (API_TOKEN) {
    headers["DOLAPIKEY"] = API_TOKEN;
  }

  return headers;
};

const buildCommonQueryParams = (filters: FilterState): URLSearchParams => {
  const queryParams = new URLSearchParams();

  if (filters.clientId) {
    queryParams.append("socids", filters.clientId);
  }

  if (filters.segments && filters.segments.length > 0) {
    queryParams.append("segments", filters.segments.join(","));
  }

  if (filters.regions && filters.regions.length > 0) {
    queryParams.append("regions", filters.regions.join(","));
  }

  if (filters.clientTypes && filters.clientTypes.length > 0) {
    queryParams.append("client_types", filters.clientTypes.join(","));
  }

  if (filters.isWholesale !== undefined) {
    queryParams.append("isWholesale", filters.isWholesale.toString());
  }

  // Période toujours sur 12 mois, ajoutée en dernier
  const periodEnd = endOfMonth(filters.period?.end ?? new Date());
  const periodStart = startOfMonth(subMonths(periodEnd, 11));

  queryParams.append("date_start", format(periodStart, "yyyy-MM-dd"));
  queryParams.append("date_end", format(periodEnd, "yyyy-MM-dd"));

  return queryParams;
};

/**
 * Récupère l'overview KPI stratégique d'un segment.
 *
 * Exemples d'endpoint généré:
 * - /cscdataapi/kpistrategique/overview/grands_comptes/
 * - /cscdataapi/kpistrategique/overview/plug_and_play/
 */
export async function fetchKpiStrategiqueOverview<
  S extends KpiStrategiqueSegment,
>(
  segment: S,
  filters: FilterState,
): Promise<KpiStrategiqueOverviewBySegment[S]> {
  const queryParams = buildCommonQueryParams(filters);
  const url = `${API_BASE_URL}/cscdataapi/kpistrategique/overview/${segment}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `KPI Strategique Overview API Error (${segment}): ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Raccourci dédié à l'endpoint:
 * /cscdataapi/kpistrategique/overview/grands_comptes/
 */
export function fetchKpiStrategiqueOverviewGrandsComptes(
  filters: FilterState,
): Promise<KpiStrategiqueOverviewGrandsComptesResponse> {
  return fetchKpiStrategiqueOverview("grands_comptes", filters);
}

/**
 * Raccourci dédié à l'endpoint:
 * /cscdataapi/kpistrategique/overview/plug_and_play/
 */
export function fetchKpiStrategiqueOverviewPlugPlay(
  filters: FilterState,
): Promise<KpiStrategiqueOverviewPlugPlayResponse> {
  return fetchKpiStrategiqueOverview("plug_and_play", filters);
}

// ── Evolution ──

/**
 * Récupère l'évolution KPI stratégique d'un segment.
 *
 * Exemples d'endpoint généré:
 * - /cscdataapi/kpistrategique/evolution/grands_comptes/
 * - /cscdataapi/kpistrategique/evolution/plug_and_play/
 */
export async function fetchKpiStrategiqueEvolution(
  segment: KpiStrategiqueSegment,
  filters: FilterState,
): Promise<KpiStrategiqueEvolutionResponse> {
  const queryParams = buildCommonQueryParams(filters);
  const url = `${API_BASE_URL}/cscdataapi/kpistrategique/evolution/${segment}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `KPI Strategique Evolution API Error (${segment}): ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export function fetchKpiStrategiqueEvolutionGrandsComptes(
  filters: FilterState,
): Promise<KpiStrategiqueEvolutionResponse> {
  return fetchKpiStrategiqueEvolution("grands_comptes", filters);
}

export function fetchKpiStrategiqueEvolutionPlugPlay(
  filters: FilterState,
): Promise<KpiStrategiqueEvolutionResponse> {
  return fetchKpiStrategiqueEvolution("plug_and_play", filters);
}
