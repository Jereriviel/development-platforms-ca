import { Request, Response, NextFunction } from "express";

/**
 * Express error-handling middleware.
 *
 * Catches errors thrown in route handlers or other middleware and sends
 * a JSON response with the appropriate HTTP status code and error message.
 *
 * @param {any} err - The error object thrown.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ error: message });
}
