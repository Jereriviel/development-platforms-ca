import { z } from "zod";
import { Request, Response, NextFunction } from "express";

//Required user data

const requiredUserDataSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must not exceed 50 characters"),
  email: z.email("Email must be a valid email"),
});

export const validateRequiredUserData = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = requiredUserDataSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => issue.message),
    });
  }

  next();
};

//Partial user data

const partialUserDataSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must not exceed 50 characters")
    .optional(),
  email: z.email("Email must be a valid email").optional(),
});

export const validatePartialUserData = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = partialUserDataSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues.map((issue) => issue.message),
    });
  }

  next();
};
