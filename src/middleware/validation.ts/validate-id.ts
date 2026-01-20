import { z } from "zod";
import { Request, Response, NextFunction } from "express";

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
