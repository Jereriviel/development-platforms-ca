import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware factory to validate route parameter IDs.
 *
 * Ensures that the `id` parameter in the request path is a positive number.
 * Can be customized with an entity name for clearer error messages.
 *
 * @param {string} [entityName="ID"] - Optional name of the entity being validated (e.g., "User ID", "Article ID").
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function.
 *
 * @example
 * // Validate a user ID in the route /users/:id
 * router.get("/users/:id", validateId("User ID"), (req, res) => { ... });
 */

export const validateId = (entityName: string = "ID") => {
  const schema = z.object({
    id: z.string().regex(/^\d+$/, `${entityName} must be a positive number`),
  });

  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((issue) => issue.message),
      });
    }
    next();
  };
};
