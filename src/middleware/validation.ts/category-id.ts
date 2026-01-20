import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const categoryIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Category ID must be a positive number"),
});

export const validateCategoryId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = categoryIdSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => issue.message),
    });
  }

  next();
};
