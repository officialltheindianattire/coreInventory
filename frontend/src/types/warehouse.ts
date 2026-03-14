export interface Location {
  id: string;
  warehouseId: string;
  name: string;
  type: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  locations?: Location[];
  _count?: {
    locations: number;
  };
}

export interface CreateWarehouseDto {
  name: string;
  location: string;
}

export interface CreateLocationDto {
  name: string;
  type: string;
}
