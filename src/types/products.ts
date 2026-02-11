export interface Products {
    products: ProductsClass;
}

export type ProductsClass = Record<string, ProductMap>;

/**
 * Map de produits par nom (Angelico, Moderato, Doña, etc.)
 */
export type ProductMap = Record<string, Product>;

export interface Product {
  category: string;
  product_name: string;
  type: string;
  quantity: number;
  ca_total_ht: number;
  volume_total: number;
  lines_count: number;
}
