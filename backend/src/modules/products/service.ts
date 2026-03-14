import { Prisma } from '@prisma/client';
import prisma from '../../utils/db';
import { ProductRepository } from './repository';

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  // --- Categories ---
  async getCategories() {
    return this.repository.getCategories();
  }

  async getCategoryById(id: string) {
    const category = await this.repository.getCategoryById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(data: Prisma.CategoryCreateInput) {
    const existing = await this.repository.getCategoryByName(data.name);
    if (existing) {
      throw new Error('Category with this name already exists');
    }
    return this.repository.createCategory(data);
  }

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    await this.getCategoryById(id); // Check existence
    
    if (typeof data.name === 'string') {
       const existing = await this.repository.getCategoryByName(data.name);
       if (existing && existing.id !== id) {
         throw new Error('Category with this name already exists');
       }
    }
    return this.repository.updateCategory(id, data);
  }

  async deleteCategory(id: string) {
    const category = await this.repository.getCategoryById(id);
    if (!category) {
       throw new Error('Category not found');
    }
    // We ideally should check if products are attached before deleting
    // Prisma will throw a foreign key error if we don't handle it gracefully,
    // but a business logic check is cleaner.
    const productsInCat = await prisma.product.findFirst({
        where: { categoryId: id }
    });
    if (productsInCat) {
        throw new Error('Cannot delete category because it contains products');
    }
    return this.repository.deleteCategory(id);
  }

  // --- Products ---
  async getProducts() {
    return this.repository.getProducts();
  }

  async getProductById(id: string) {
    const product = await this.repository.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(data: Prisma.ProductUncheckedCreateInput & { initialQuantity?: number, locationId?: string }) {
    const { initialQuantity, locationId, ...productData } = data;
    const existingSku = await this.repository.getProductBySku(productData.sku);
    if (existingSku) {
      throw new Error('Product with this SKU already exists');
    }
    await this.getCategoryById(productData.categoryId); // Ensure category exists
    
    // Check if location exists if requested
    if (initialQuantity && initialQuantity > 0 && locationId) {
       const loc = await prisma.location.findUnique({ where: { id: locationId } });
       if (!loc) throw new Error('Location not found');
    }

    const product = await this.repository.createProduct(productData);

    // If initial quantity is provided, create an adjustment stock movement to reflect the starting balance
    if (initialQuantity && initialQuantity > 0 && locationId) {
       await prisma.$transaction(async (tx) => {
         // Create the adjustment record
         const adjustment = await tx.adjustment.create({
            data: {
               productId: product.id,
               locationId: locationId,
               quantityChange: initialQuantity,
               reason: 'Initial stock on product creation',
            }
         });
         // Create the corresponding stock movement
         await tx.stockMovement.create({
            data: {
               productId: product.id,
               toLocationId: locationId,
               fromLocationId: null,
               quantity: initialQuantity,
               movementType: 'ADJUSTMENT',
               referenceId: adjustment.id,
               referenceType: 'ADJUSTMENT'
            }
         });
       });
    }

    return product;
  }

  async updateProduct(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    await this.getProductById(id); // Check existence
    
    if (typeof data.sku === 'string') {
       const existingSku = await this.repository.getProductBySku(data.sku);
       if (existingSku && existingSku.id !== id) {
         throw new Error('Product with this SKU already exists');
       }
    }
    if (typeof data.categoryId === 'string') {
        await this.getCategoryById(data.categoryId);
    }
    return this.repository.updateProduct(id, data);
  }

  async deleteProduct(id: string) {
    await this.getProductById(id); // Check existence
    return this.repository.deleteProduct(id);
  }
}
