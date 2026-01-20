import { z } from "zod";
import { validate } from "./validate.js";

// Required Comment data

const requiredCommentDataSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(500, "Comment must not exceed 500 characters"),

  article_id: z
    .number()
    .int("Article ID must be an integer")
    .positive("Article ID must be a positive number"),
});

export const validateRequiredCommentData = validate(requiredCommentDataSchema);

// Partial Comment data

const partialCommentDataSchema = z.object({
  content: z
    .string()
    .min(1, "Comment must not be empty")
    .max(500, "Comment must not exceed 500 characters")
    .optional(),

  article_id: z
    .number()
    .int("Article ID must be an integer")
    .positive("Article ID must be a positive number")
    .optional(),
});

export const validatePartialCommentData = validate(partialCommentDataSchema);
