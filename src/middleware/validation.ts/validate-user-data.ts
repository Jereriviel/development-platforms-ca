import { z } from "zod";
import { validateData } from "./validate-data.js";

//Required User data

const requiredUserDataSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must not exceed 50 characters"),
  email: z.email("Email must be a valid email"),
});

export const validateRequiredUserData = validateData(requiredUserDataSchema);

//Partial User data

const partialUserDataSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must not exceed 50 characters")
    .optional(),
  email: z.email("Email must be a valid email").optional(),
});

export const validatePartialUserData = validateData(partialUserDataSchema);
