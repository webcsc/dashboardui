import type { FilterState } from "@/types";
import { Products } from "@/types/products";
import { ThirdPartie } from "@/types/thirdparti";
import { format, subMonths } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Interface pour la réponse de l'endpoint Overview
 */
export interface OverviewResponse {
  data: {
    universe: string;
    date_start: string;
    date_end: string;
    ca_total_ht_global: number;
    volume_total_global: number;
    part_b2b: number;
    average_price_per_kg: number;

    // cafe specifique
    ca_total_ht_cafe?: number;
    volume_total_cafe?: number;

    // Champs Spécifiques Univers Service
    ca_installation_total_ht?: number;
    ca_reparation_total_ht?: number;
    ca_cartouche_total_ht?: number;
    ca_pret_total_ht?: number;
    ca_echange_total_ht?: number;

    // Champs Spécifiques Univers Equipement (Supposés)
    ca_location_total_ht?: number;
    ca_vente_total_ht?: number;
    ca_assistance_total_ht?: number;
    ca_entretien_total_ht?: number;

    // Autres champs potentiels
    [key: string]: number | string;
  };
}

/**
 * Interface pour les données mensuelles communes
 */
export interface BaseMonthData {
  actif: number;
  nombre_facture: number;
  nombre_product: number;
  ca_total_ht: number;
}

/**
 * Interface pour les données mensuelles Café
 */
export interface CafeMonthData extends BaseMonthData {
  volume_total: number;
}

/**
 * Interface pour les données mensuelles Equipement
 * Les clés sont dynamiques (ex: "MACHINES", "LOCATION MACHINES")
 */
export interface EquipementMonthData {
  [category: string]: BaseMonthData;
}

/**
 * Interface pour les données mensuelles Service
 * Les clés sont les types de service (ex: "installation", "reparation", etc.)
 */
export interface ServiceMonthData {
  [serviceType: string]: BaseMonthData;
}

type MonthData = CafeMonthData | EquipementMonthData | ServiceMonthData;

type YearData<T> = Record<string, T extends MonthData ? T : MonthData>;

/**
 * Interface pour la réponse de l'endpoint Evolution
 */
export interface EvolutionResponse<T> {
  data: {
    years: YearData<T>;
    total: {
      ca_total_ht_global: number;
      volume_total_global?: number;
      univers: string;
    };
  };
}

/**
 * Interface pour un item de distribution
 */
export interface DistributionItem {
  poid_unit: string;
  percentage_kg?: number;
  percentage_ht?: number;
  nombre_produit: number;
  nombre_lignes: number;
  ca_total_ht: number;
  poids_total: number;
  total_ht?: number;
}

/**
 * Interface pour la réponse de l'endpoint Distribution
 */
export interface DistributionResponse {
  distribution: {
    [poids: string]: DistributionItem;
  };
  summary: {
    total_poids_global_kg: number;
  };
}

/**
 * Interface pour l'overview d'un univers dans le summary
 */
export interface UniverseOverview {
  universe: string;
  date_start: string;
  date_end: string;
  ca_total_ht_global: number;
  volume_total_global?: number;
  part_b2b?: string | number;
  average_price_per_kg?: string | number;
  // cafe specifique
  ca_total_ht_cafe?: number;
  volume_total_cafe?: number;
  // Equipement specific
  ca_location_total_ht?: number;
  ca_vente_total_ht?: number;
  ca_assistance_total_ht?: number;
  ca_entretien_total_ht?: number;
  // Service specific
  ca_installation_total_ht?: number;
  ca_reparation_total_ht?: number;
  ca_cartouche_total_ht?: number;
  ca_echange_total_ht?: number;
}

/**
 * Interface pour les données d'évolution d'un mois pour equipement/service (array)
 */
export interface UniverseMonthDataItem {
  universe: string;
  nombre_facture: number;
  nombre_product: number;
  ca_total_ht: number;
}

/**
 * Interface pour les données d'évolution d'un mois pour cafe (object)
 */
export interface CafeMonthData {
  universe: string;
  nombre_facture: number;
  nombre_product: number;
  ca_total_ht: number;
  volume_total: number;
}

type MonthBaseData<T> = Record<string, T>;
type YearBaseData<T> = Record<string, MonthBaseData<T>>;

/**
 * Interface pour la réponse de l'endpoint Summary
 */
export interface SummaryResponse {
  overview: {
    cafe: UniverseOverview;
    equipement: UniverseOverview;
    service: UniverseOverview;
  };
  evolution: {
    cafe: {
      years: YearBaseData<CafeMonthData>;
      total: {
        ca_total_ht_global: number;
        volume_total_global: number;
        univers: string;
      };
    };
    equipement: {
      years: YearBaseData<EquipementMonthData>;
      total: {
        ca_total_ht_global: number;
      };
    };
    service: {
      years: YearBaseData<ServiceMonthData>;
      total: {
        ca_total_ht_global: number;
      };
    };
  };
}

/**
 * Interface pour un tiers (client B2B)
 */
export interface Thirdparty {
  id: string;
  name: string;
}

/**
 * Headers d'authentification Basic
 */
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "";

/**
 * Headers d'authentification (Dolibarr style)
 */
const getAuthHeaders = () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (API_TOKEN) {
    headers["DOLAPIKEY"] = API_TOKEN;
  }
  return headers;
};

/**
 * Récupère les données de synthèse (Overview) pour un univers donné.
 *
 * Effectue un appel GET vers l'API avec les paramètres de date et de recherche produits.
 *
 * @param universe - Identifiant de l'univers ('cafe', 'equipement', 'service').
 * @param filters - Filtres actifs (période, recherche produit, etc.).
 * @returns Une promesse contenant les données de synthèse pour l'univers.
 *
 * @throws {Error} Si la requête échoue (status non-2xx).
 *
 * @example
 * ```typescript
 * const overview = await fetchOverview('cafe', filters);
 * console.log(overview.data.ca_total_ht_global);
 * ```
 */
export async function fetchOverview(
  universe: string,
  filters: FilterState,
): Promise<OverviewResponse> {
  const queryParams = new URLSearchParams();

  // Format dates YYYY-MM-DD
  if (filters.period) {
    queryParams.append(
      "date_start",
      format(filters.period.start, "yyyy-MM-dd"),
    );
    queryParams.append("date_end", format(filters.period.end, "yyyy-MM-dd"));
  }

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

  const url = `${API_BASE_URL}/cscdataapi/overview/${universe}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Overview API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Récupère les données d'évolution pour un univers donné.
 *
 * Effectue un appel GET vers l'API en utilisant l'année extraite du filtre de période.
 *
 * @param universe - Identifiant de l'univers ('cafe', 'equipement', 'service').
 * @param filters - Filtres actifs (utilisés pour déterminer l'année de l'historique).
 * @returns Une promesse contenant les données d'évolution mensuelle.
 *
 * @throws {Error} Si la requête échoue (status non-2xx).
 *
 * @example
 * ```typescript
 * const evolution = await fetchEvolution('cafe', filters);
 * console.log(evolution.data.total);
 * ```
 */
export async function fetchEvolution<T>(
  universe: string,
  filters: FilterState, // Utilisé pour extraire l'année si non fournie explicitement
): Promise<EvolutionResponse<T>> {
  const queryParams = new URLSearchParams();

  // Format dates YYYY-MM-DD
  if (filters.period) {
    queryParams.append(
      "date_start",
      format(filters.period.start, "yyyy-MM-dd"),
    );
    queryParams.append("date_end", format(filters.period.end, "yyyy-MM-dd"));
  }

  if (filters.clientId) {
    queryParams.append("socids", filters.clientId);
  }

  if (filters.regions && filters.regions.length > 0) {
    queryParams.append("regions", filters.regions.join(","));
  }

  if (filters.clientTypes && filters.clientTypes.length > 0) {
    queryParams.append("client_types", filters.clientTypes.join(","));
  }

  const url = `${API_BASE_URL}/cscdataapi/evolution/${universe}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Evolution API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Récupère les données de distribution pour un univers donné.
 *
 * @param universe - Identifiant de l'univers ('cafe', 'service').
 * @param filters - Filtres actifs (période, etc.).
 * @returns Une promesse contenant les données de distribution.
 *
 * @throws {Error} Si la requête échoue (status non-2xx).
 *
 * @example
 * ```typescript
 * const distribution = await fetchDistribution('cafe', filters);
 * console.log(distribution.data);
 * ```
 */
export async function fetchDistribution(
  universe: string,
  filters: FilterState,
): Promise<DistributionResponse> {
  const queryParams = new URLSearchParams();

  // Format dates YYYY-MM-DD
  if (filters.period) {
    queryParams.append(
      "date_start",
      format(filters.period.start, "yyyy-MM-dd"),
    );
    queryParams.append("date_end", format(filters.period.end, "yyyy-MM-dd"));
  }

  if (filters.clientId) {
    queryParams.append("socids", filters.clientId);
  }

  if (filters.regions && filters.regions.length > 0) {
    queryParams.append("regions", filters.regions.join(","));
  }

  if (filters.clientTypes && filters.clientTypes.length > 0) {
    queryParams.append("client_types", filters.clientTypes.join(","));
  }

  const url = `${API_BASE_URL}/cscdataapi/distribution/${universe}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Distribution API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Récupère les données consolidées de tous les univers (overview + evolution).
 *
 * @param filters - Filtres actifs (période, etc.).
 * @returns Une promesse contenant les données consolidées.
 *
 * @throws {Error} Si la requête échoue (status non-2xx).
 *
 * @example
 * ```typescript
 * const summary = await fetchSummary(filters);
 * console.log(summary.overview.cafe.ca_total_ht_global);
 * ```
 */
export async function fetchSummary(
  filters: FilterState,
): Promise<SummaryResponse> {
  const queryParams = new URLSearchParams();

  // Format dates YYYY-MM-DD
  if (filters.period) {
    queryParams.append(
      "date_start",
      format(filters.period.start, "yyyy-MM-dd"),
    );
    queryParams.append("date_end", format(filters.period.end, "yyyy-MM-dd"));
  }

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

  const url = `${API_BASE_URL}/cscdataapi/summary?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Summary API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Récupère les données d'évolution pour un univers donné.
 *
 * Effectue un appel GET vers l'API en utilisant l'année extraite du filtre de période.
 *
 * @param universe - Identifiant de l'univers ('cafe', 'equipement', 'service').
 * @param filters - Filtres actifs (utilisés pour déterminer l'année de l'historique).
 * @returns Une promesse contenant les données d'évolution mensuelle.
 *
 * @throws {Error} Si la requête échoue (status non-2xx).
 *
 * @example
 * ```typescript
 * const evolution = await fetchProducts('cafe', filters);
 * console.log(evolution.data.total);
 * ```
 */
export async function fetchProducts<T>(
  universe: string,
  filters: FilterState, // Utilisé pour extraire l'année si non fournie explicitement
): Promise<Products<T>> {
  const queryParams = new URLSearchParams();

  // Format dates YYYY-MM-DD
  if (filters.period) {
    queryParams.append(
      "date_start",
      format(filters.period.start, "yyyy-MM-dd"),
    );
    queryParams.append("date_end", format(filters.period.end, "yyyy-MM-dd"));
  }

  if (filters.clientId) {
    queryParams.append("socids", filters.clientId);
  }

  if (filters.regions && filters.regions.length > 0) {
    queryParams.append("regions", filters.regions.join(","));
  }

  if (filters.clientTypes && filters.clientTypes.length > 0) {
    queryParams.append("client_types", filters.clientTypes.join(","));
  }

  const url = `${API_BASE_URL}/cscdataapi/products/${universe}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Products API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Récupère la liste des tiers (clients B2B) actifs depuis Dolibarr.
 *
 * @returns Une promesse contenant la liste des tiers formatés (id, name).
 *
 * @throws {Error} Si la requête échoue (status non-2xx).
 *
 * @example
 * ```typescript
 * const thirdparties = await fetchThirdparties();
 * console.log(thirdparties);
 * ```
 */
export async function fetchThirdparties(): Promise<ThirdPartie[]> {
  const queryParams = new URLSearchParams();
  queryParams.append("sortfield", "t.rowid");
  queryParams.append("sortorder", "ASC");
  queryParams.append("sqlfilters", "t.status:=:1");

  const url = `${API_BASE_URL}/thirdparties?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Thirdparties API Error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  // Format data to only include id and name
  return data.map((item: ThirdPartie) => ({
    id: item.id?.toString() || "",
    name: item.name || "",
  }));
}
