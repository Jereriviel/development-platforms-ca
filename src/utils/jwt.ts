import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 *
 * @param {number} userId - The ID of the user for whom the token is generated.
 * @returns {string} A JWT string that expires in 24 hours.
 */

export function generateToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Verifies a given JSON Web Token (JWT).
 *
 * @param {string} token - The JWT to verify.
 * @returns {{ userId: number } | null} The decoded token payload if valid; otherwise, null if the token is invalid or expired.
 */

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch (error) {
    return null;
  }
}
