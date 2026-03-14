import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors = (result.error as any).issues.map((e: ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'Validation failed', 400, errors);
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors = (result.error as any).issues.map((e: ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'Query validation failed', 400, errors);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.query = result.data as any;
    next();
  };
};

