import { Request, Response } from 'express';
import { authService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import logger from '../../utils/logger';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error: any) {
      logger.error('Registration error', { error: error.message });
      if (error.message === 'Email already registered') {
        return sendError(res, error.message, 409);
      }
      return sendError(res, 'Registration failed', 500);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Login successful', 200);
    } catch (error: any) {
      logger.error('Login error', { error: error.message });
      if (error.message === 'Invalid email or password') {
        return sendError(res, error.message, 401);
      }
      return sendError(res, 'Login failed', 500);
    }
  }
}

export const authController = new AuthController();
