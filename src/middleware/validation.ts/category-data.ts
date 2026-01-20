import { z } from "zod";
import { validate } from "./validate.js";

// Required Category data

const requiredCategoryDataSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name must not exceed 100 characters"),

  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must not exceed 500 characters"),
});

export const validateRequiredCategoryData = validate(
  requiredCategoryDataSchema,
);

// Partial Category data

const partialCategoryDataSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name must not exceed 100 characters")
    .optional(),

  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must not exceed 500 characters")
    .optional(),
});

export const validatePartialCategoryData = validate(partialCategoryDataSchema);
