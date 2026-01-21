import { Request } from "express";

/**
 * Extracts pagination parameters from a request query.
 *
 * This function reads `page` and `limit` from `req.query` and calculates
 * the `offset` for SQL queries. Default values are page 1 and limit 10.
 *
 * @param {Request} req - The Express request object containing query parameters.
 * @returns {{ page: number, limit: number, offset: number }} An object with:
 *  - `page`: The current page number (default 1)
 *  - `limit`: The number of items per page (default 10)
 *  - `offset`: The calculated offset for SQL queries
 *
 * @example
 * // For URL: /users?page=2&limit=5
 * const { page, limit, offset } = getPagination(req);
 * console.log(page, limit, offset); // 2, 5, 5
 */

export function getPagination(req: Request) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
