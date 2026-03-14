export interface Category {
  id: string;
  name: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unitOfMeasure: string;
  unitCost?: number;
  createdAt: string;
  category?: Category;
}

export interface CreateCategoryDto {
  name: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  categoryId: string;
  unitOfMeasure: string;
  unitCost?: number;
  initialQuantity?: number;
  locationId?: string;
}
