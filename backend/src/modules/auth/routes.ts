import { Router } from 'express';
import { authController } from './controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;
