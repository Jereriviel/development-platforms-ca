import { Router, Request, Response, NextFunction } from "express";
import { pool } from "../database.js";
import { ResultSetHeader } from "mysql2";
import { Comment, CommentWithName } from "../types/comments.js";
import {
  validatePartialCommentData,
  validateRequiredCommentData,
} from "../middleware/validation.ts/comment-data.js";
import { validateId } from "../middleware/validation.ts/validate-id.js";
import { authenticateToken } from "../middleware/validation.ts/auth.js";

const router = Router();

router.get("/comments", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        comments.id,
        comments.content,
        comments.article_id,
        comments.user_id,
        users.username AS user_name,
        comments.created_at
      FROM comments
      INNER JOIN users ON comments.user_id = users.id
     `,
    );
    const comments = rows as CommentWithName[];

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/comments/:id",
  validateId("Comment ID"),
  async (req, res, next) => {
    try {
      const commentId = Number(req.params.id);
      const [rows] = await pool.execute(
        `
      SELECT
        comments.id,
        comments.content,
        comments.article_id,
        comments.user_id,
        users.username AS user_name,
        comments.created_at
      FROM comments
      INNER JOIN users ON comments.user_id = users.id
      WHERE comments.id = ?
     `,
        [commentId],
      );

      const comments = rows as CommentWithName[];

      if (comments.length === 0) {
        return next({ status: 404, message: "Comment not found" });
      }

      res.json(comments[0]);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/comments",
  authenticateToken,
  validateRequiredCommentData,
  async (req, res, next) => {
    try {
      const user_id = req.user!.id;
      const { content, article_id } = req.body;
      const [articleRows] = await pool.execute(
        "SELECT id FROM articles WHERE id = ?",
        [article_id],
      );

      const articles = articleRows as { id: number }[];

      if (articles.length === 0) {
        return res.status(404).json({
          message: "Article not found",
        });
      }

      const [result]: [ResultSetHeader, any] = await pool.execute(
        "INSERT INTO comments (content, article_id, user_id) VALUES (?, ?, ?)",
        [content, article_id, user_id],
      );

      res.status(201).json({
        id: result.insertId,
        content,
        article_id,
        user_id,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/comments/:id",
  authenticateToken,
  validateId("Comment ID"),
  validateRequiredCommentData,
  async (req, res, next) => {
    try {
      const commentId = Number(req.params.id);
      const userId = req.user!.id;
      const { content, article_id } = req.body;
      const [articleRows] = await pool.execute(
        "SELECT id FROM articles WHERE id = ?",
        [article_id],
      );

      if ((articleRows as any[]).length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      const [result]: [ResultSetHeader, any] = await pool.execute(
        "UPDATE comments SET content = ?, article_id = ? WHERE id = ? AND user_id = ?",
        [content, article_id, commentId, userId],
      );

      if (result.affectedRows === 0) {
        return res.status(403).json({
          message: "You can only edit your own comments",
        });
      }

      res.status(201).json({
        id: commentId,
        content,
        article_id,
        user_id: userId,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/comments/:id",
  authenticateToken,
  validateId("Comment ID"),
  validatePartialCommentData,
  async (req, res, next) => {
    try {
      const commentId = Number(req.params.id);
      const userId = req.user!.id;
      const { content, article_id } = req.body;

      const fieldsToUpdate: string[] = [];
      const values: any[] = [];

      if (content) {
        fieldsToUpdate.push("content = ?");
        values.push(content);
      }

      if (article_id) {
        fieldsToUpdate.push("article_id = ?");
        values.push(article_id);
      }

      values.push(commentId, userId);

      if (article_id) {
        const [articleRows] = await pool.execute(
          "SELECT id FROM articles WHERE id = ?",
          [article_id],
        );

        if ((articleRows as any[]).length === 0) {
          return res.status(404).json({ message: "Article not found" });
        }
      }

      const query = `UPDATE comments SET ${fieldsToUpdate.join(
        ", ",
      )} WHERE id = ? AND user_id = ?`;

      const [result]: [ResultSetHeader, any] = await pool.execute(
        query,
        values,
      );

      if (result.affectedRows === 0) {
        return res.status(403).json({
          message: "You can only edit your own comments",
        });
      }

      const [rows] = await pool.execute("SELECT * FROM comments WHERE id = ?", [
        commentId,
      ]);

      const comments = rows as Comment[];

      res.json(comments[0]);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/comments/:id",
  authenticateToken,
  validateId("Comment ID"),
  async (req, res, next) => {
    try {
      const commentId = Number(req.params.id);
      const userId = req.user!.id;
      const [result]: [ResultSetHeader, any] = await pool.execute(
        "DELETE FROM comments WHERE id = ? AND user_id = ?",
        [commentId, userId],
      );

      if (result.affectedRows === 0) {
        return res.status(403).json({
          message: "You can only delete your own comments",
        });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export const commentsRouter = router;
