export interface Products {
    products: ProductsClass;
}
export interface ProductsClass {
  "Café en Grains": ProductMap;
  "Café Moulu": Product[];
  "Café Dosette": Product[];
  "Autres": Product[];
}

/**
 * Map de produits par nom (Angelico, Moderato, Doña, etc.)
 */
export type ProductMap = Record<string, Product>;

export interface Product {
  category: string;
  product_name: string;
  type: string;
  quantity: number;
  total_ht: number;
  volume_total: number;
  lines_count: number;
}
