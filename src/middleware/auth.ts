import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

/**
 * Middleware to authenticate requests using a JSON Web Token (JWT).
 *
 * Checks for the presence of an `Authorization` header with the format
 * `Bearer <token>`. If the token is valid, attaches the decoded user ID
 * to `req.user` and calls `next()`. Otherwise, it sends a 401 or 403 response.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 *
 * @returns {void} Sends an HTTP error response if authentication fails.
 *
 * @example
 * // Protect a route using the authenticateToken middleware
 * router.get("/protected", authenticateToken, (req, res) => {
 *   res.json({ message: `Hello user ${req.user.id}` });
 * });
 */

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Access token required",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token must be in format: Bearer <token>",
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(403).json({
      error: "Invalid or expired token",
    });
  }

  req.user = { id: payload.userId };
  next();
}
