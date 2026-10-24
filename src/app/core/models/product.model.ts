export interface Product {
  id: number;
  name: string;
  sku: string;
  brand: string;
  category: string;
  supplier: string;
  warehouse: string;
  price: number;
  stock: number;
}

export type ProductPayload = Omit<Product, 'id'>;
