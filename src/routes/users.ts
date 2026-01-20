import { Router } from "express";
import { pool } from "../database.js";
import { ResultSetHeader } from "mysql2";
import { User } from "../types/users.js";
import {
  validateRequiredUserData,
  validatePartialUserData,
} from "../middleware/validation.ts/user-data.js";
import { validateId } from "../middleware/validation.ts/validate-id.js";
import { authenticateToken } from "../middleware/validation.ts/auth.js";

const router = Router();

//GET /users

router.get("/users", async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT id, username, email FROM users");

    res.json(rows as User[]);
  } catch (error) {
    next(error);
  }
});

//GET /users/:id

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

//GET /users/:id/comments

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

//GET /users/:id/articles

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

//PUT /users/:id

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

//PATCH /users/:id

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

//DELETE /users/:id

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
