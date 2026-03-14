import prisma from '../../utils/db';
import { Prisma } from '@prisma/client';

export class ProductRepository {
  // --- Categories ---
  async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async getCategoryById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async getCategoryByName(name: string) {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({
      data,
    });
  }

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  // --- Products ---
  async getProducts() {
    return prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: {
        category: true,
      }
    });
  }

  async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      }
    });
  }

  async getProductBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  async createProduct(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({
      data,
      include: {
        category: true,
      }
    });
  }

  async updateProduct(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      }
    });
  }

  async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
