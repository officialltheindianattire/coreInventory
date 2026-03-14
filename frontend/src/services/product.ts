import api from './api';
import { Category, Product, CreateCategoryDto, CreateProductDto } from '../types/product';

export const productService = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post('/products/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryDto>): Promise<Category> => {
    const response = await api.put(`/products/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/products/categories/${id}`);
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<CreateProductDto>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
