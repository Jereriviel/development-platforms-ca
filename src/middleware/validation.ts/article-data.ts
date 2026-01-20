import { z } from "zod";
import { validate } from "./validate.js";

// Required Article data

const requiredArticleDataSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters"),

  body: z
    .string()
    .min(1, "Body is required")
    .max(5000, "Body must not exceed 5000 characters"),

  category_id: z
    .number()
    .int("Category ID must be an integer")
    .positive("Category ID must be a positive number"),
});

// Partial Article data

const partialArticleDataSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters")
    .optional(),

  body: z
    .string()
    .min(1, "Body is required")
    .max(5000, "Body must not exceed 5000 characters")
    .optional(),

  category_id: z
    .number()
    .int("Category ID must be an integer")
    .positive("Category ID must be a positive number")
    .optional(),
});

export const validatePartialArticleData = partialArticleDataSchema;
