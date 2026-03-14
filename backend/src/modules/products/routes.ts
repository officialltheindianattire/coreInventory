import { Router } from 'express';
import { ProductController } from './controller';
import { ProductService } from './service';
import { ProductRepository } from './repository';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { Role } from '@prisma/client';
import { categorySchema, productSchema } from './validator';

const router = Router();

// Dependency Injection
const repository = new ProductRepository();
const service = new ProductService(repository);
const controller = new ProductController(service);

// Apply authentication middleware to all routes
router.use(authenticate);

// --- Categories ---
router.get('/categories', controller.getCategories);
router.post('/categories', authorize(Role.ADMIN, Role.MANAGER), validate(categorySchema), controller.createCategory);
router.put('/categories/:id', authorize(Role.ADMIN, Role.MANAGER), validate(categorySchema.partial()), controller.updateCategory);
router.delete('/categories/:id', authorize(Role.ADMIN), controller.deleteCategory);

// --- Products ---
router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', authorize(Role.ADMIN, Role.MANAGER), validate(productSchema), controller.createProduct);
router.put('/:id', authorize(Role.ADMIN, Role.MANAGER), validate(productSchema.partial()), controller.updateProduct);
router.delete('/:id', authorize(Role.ADMIN), controller.deleteProduct);

export default router;
