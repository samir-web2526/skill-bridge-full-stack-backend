import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });

      if (!result.success) {
        return next(result.error);
      }

      // Using 'any' to avoid potential type augmentation issues with Express Request
      const data = result.data as any;
      const request = req as any;
      
      if (data.body !== undefined) request.body = data.body;
      if (data.query !== undefined) request.query = data.query;
      if (data.params !== undefined) request.params = data.params;
      if (data.cookies !== undefined) request.cookies = data.cookies;

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
