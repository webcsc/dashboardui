export interface Products<T = Product> {
  products: ProductsClass<T>;
}

export type ProductsClass<T = Product> = Record<string, ProductMap<T>>;

/**
 * Map de produits par nom (Angelico, Moderato, Doña, etc.)
 */
export type ProductMap<T = Product> = Record<string, T>;

export interface Product {
  category: string;
  product_name: string;
  type: string;
  quantity: number;
  ca_total_ht: number;
  volume_total: number;
  lines_count: number;
}

export type EquipementProductMap = Record<string, EquipementProduct>;
export interface EquipementProduct {
  ca_total_ht: number;
  count: number;
}
