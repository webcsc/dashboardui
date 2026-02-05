import type { FilterState } from '@/types';
import { format } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
        [key: string]: any;
    }
}

/**
 * Interface pour un mois dans la réponse Evolution
 */
export interface EvolutionMonthData {
    universe: string;
    nombre_facture: number;
    nombre_product: number;
    ca_total_ht: number;
    volume_total: number;
    part_b2b: number;
    average_price_per_kg: number;
}

/**
 * Interface pour la réponse de l'endpoint Evolution
 */
export interface EvolutionResponse {
    data: {
        [year: string]: {
            [month: string]: EvolutionMonthData;
        } | any; // 'any' pour 'total' qui est un objet différent
        total: {
            ca_total_ht_global: number;
            volume_total_global: number;
            univers: string;
        }
    }
}

/**
 * Interface pour un item de distribution
 */
export interface DistributionItem {
    poid_unit: string;
    percentage_kg: number;
    nombre_produit: number;
    nombre_lignes: number;
    ca_total_ht: number;
    poids_total: number;
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
    }
}

/**
 * Headers d'authentification Basic
 */
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

/**
 * Headers d'authentification (Dolibarr style)
 */
const getAuthHeaders = () => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (API_TOKEN) {
        headers['DOLAPIKEY'] = API_TOKEN;
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
    filters: FilterState
): Promise<OverviewResponse> {
    const queryParams = new URLSearchParams();

    // Format dates YYYY-MM-DD
    if (filters.period) {
        queryParams.append('date_start', format(filters.period.start, 'yyyy-MM-dd'));
        queryParams.append('date_end', format(filters.period.end, 'yyyy-MM-dd'));
    }

    if (filters.searchProduct) {
        queryParams.append('search_product', filters.searchProduct);
    }

    if (filters.segments && filters.segments.length > 0) {
        queryParams.append('segments', filters.segments.join(','));
    }

    if (filters.regions && filters.regions.length > 0) {
        queryParams.append('regions', filters.regions.join(','));
    }

    if (filters.clientTypes && filters.clientTypes.length > 0) {
        queryParams.append('client_types', filters.clientTypes.join(','));
    }

    const url = `${API_BASE_URL}/cscdataapi/overview/${universe}?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Overview API Error: ${response.status} ${response.statusText}`);
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
export async function fetchEvolution(
    universe: string,
    filters: FilterState // Utilisé pour extraire l'année si non fournie explicitement
): Promise<EvolutionResponse> {
    const queryParams = new URLSearchParams();

    const year = filters.period.start.getFullYear().toString();
    queryParams.append('annee', year);

    if (filters.searchProduct) {
        queryParams.append('search_product', filters.searchProduct);
    }


    if (filters.regions && filters.regions.length > 0) {
        queryParams.append('regions', filters.regions.join(','));
    }

    if (filters.clientTypes && filters.clientTypes.length > 0) {
        queryParams.append('client_types', filters.clientTypes.join(','));
    }

    const url = `${API_BASE_URL}/cscdataapi/evolution/${universe}?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Evolution API Error: ${response.status} ${response.statusText}`);
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
    filters: FilterState
): Promise<DistributionResponse> {
    const queryParams = new URLSearchParams();

    // Format dates YYYY-MM-DD
    if (filters.period) {
        queryParams.append('date_start', format(filters.period.start, 'yyyy-MM-dd'));
        queryParams.append('date_end', format(filters.period.end, 'yyyy-MM-dd'));
    }

    const url = `${API_BASE_URL}/cscdataapi/distribution/${universe}?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Distribution API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
