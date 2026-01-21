import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware factory to validate request bodies using a Zod schema.
 *
 * Validates `req.body` against the provided Zod schema. If validation fails,
 * it returns a 400 response with details about the validation errors.
 *
 * @param {z.ZodSchema} schema - A Zod schema to validate the request body against.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function.
 *
 * @example
 * // Validate a request body for creating an article
 * router.post("/articles", validateData(articleSchema), (req, res) => { ... });
 */

export const validateData =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((issue) => issue.message),
      });
    }

    next();
  };
