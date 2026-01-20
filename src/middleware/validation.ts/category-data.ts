import { z } from "zod";
import { validateData } from "./validate-data.js";

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

export const validateRequiredCategoryData = validateData(
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

export const validatePartialCategoryData = validateData(
  partialCategoryDataSchema,
);
