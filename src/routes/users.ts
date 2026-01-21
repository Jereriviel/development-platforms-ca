import { Router } from "express";
import { pool } from "../database.js";
import { ResultSetHeader } from "mysql2";
import { User } from "../types/users.js";
import {
  validateRequiredUserData,
  validatePartialUserData,
} from "../middleware/validation.ts/validate-user-data.js";
import { validateId } from "../middleware/validation.ts/validate-id.js";
import { authenticateToken } from "../middleware/auth.js";
import { getPagination } from "../utils/pagination.js";

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a paginated list of all users with their ID, username, and email.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number (default is 1)
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of users per page (default is 10)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/users", async (req, res, next) => {
  try {
    const { limit, offset } = getPagination(req);
    const [rows] = await pool.execute(
      "SELECT id, username, email FROM users ORDER BY id ASC LIMIT ? OFFSET ?",
      [limit.toString(), offset.toString()],
    );
    const users = rows as User[];

    res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     description: Returns the user identified by the given ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User object
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/users/:id", validateId("User ID"), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    const [rows] = await pool.execute(
      "SELECT id, username, email FROM users WHERE id = ?",
      [userId],
    );

    const users = rows as User[];

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}/comments:
 *   get:
 *     summary: Get all comments by a user
 *     description: Returns all comments submitted by the specified user.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of comments
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get(
  "/users/:id/comments",
  validateId("User ID"),
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);

      const [rows] = await pool.execute(
        `
      SELECT 
        id,
        content,
        article_id,
        user_id
      FROM comments
      WHERE user_id = ?
      `,
        [userId],
      );

      res.json(rows);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /users/{id}/articles:
 *   get:
 *     summary: Get all articles by a user
 *     description: Returns all articles submitted by the specified user.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of articles
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get(
  "/users/:id/articles",
  validateId("User ID"),
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);

      const [rows] = await pool.execute(
        `
      SELECT 
        id,
        title,
        body,
        category_id,
        user_id
      FROM articles
      WHERE user_id = ?
      `,
        [userId],
      );

      res.json(rows);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Replaces the user's username and email. Requires authentication and ownership.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only edit your own user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.put(
  "/users/:id",
  validateId("User ID"),
  validateRequiredUserData,
  authenticateToken,
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);

      if (req.user!.id !== userId) {
        return res.status(403).json({
          message: "You can only edit your own user",
        });
      }

      const { username, email } = req.body;

      const [result]: [ResultSetHeader, any] = await pool.execute(
        "UPDATE users SET username = ?, email = ? WHERE id = ?",
        [username, email, userId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: userId, username, email });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Partially update a user
 *     description: Updates one or more fields (username or email) of the user. Requires authentication and ownership.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Optional new username
 *               email:
 *                 type: string
 *                 description: Optional new email
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only edit your own user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.patch(
  "/users/:id",
  validateId("User ID"),
  validatePartialUserData,
  authenticateToken,
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);

      if (req.user!.id !== userId) {
        return res.status(403).json({
          message: "You can only edit your own user",
        });
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (req.body.username) {
        fields.push("username = ?");
        values.push(req.body.username);
      }

      if (req.body.email) {
        fields.push("email = ?");
        values.push(req.body.email);
      }

      values.push(userId);

      const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

      const [result]: [ResultSetHeader, any] = await pool.execute(
        query,
        values,
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const [rows] = await pool.execute(
        "SELECT id, username, email FROM users WHERE id = ?",
        [userId],
      );

      res.json((rows as User[])[0]);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes the user with the specified ID. Requires authentication and ownership.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only delete your own user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.delete(
  "/users/:id",
  validateId("User ID"),
  authenticateToken,
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);

      if (req.user!.id !== userId) {
        return res.status(403).json({
          message: "You can only delete your own user",
        });
      }

      const [result]: [ResultSetHeader, any] = await pool.execute(
        "DELETE FROM users WHERE id = ?",
        [userId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export const usersRouter = router;
