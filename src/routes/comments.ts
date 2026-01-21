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

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     description: Returns a list of all comments including the user who submitted each comment.
 *     responses:
 *       200:
 *         description: Array of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   content:
 *                     type: string
 *                   article_id:
 *                     type: number
 *                   user_id:
 *                     type: number
 *                   user_name:
 *                     type: string
 *                   created_at:
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

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a single comment by ID
 *     description: Returns the comment identified by its ID, including the user who submitted it.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the comment to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment object
 *       400:
 *         description: Invalid comment ID
 *       404:
 *         description: Comment not found
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

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     description: Creates a new comment on an article. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - article_id
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *               article_id:
 *                 type: number
 *                 description: The ID of the article this comment belongs to
 *     responses:
 *       201:
 *         description: Comment created
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Article not found
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

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Replaces the comment with the specified ID with new content and article_id. Requires authentication and ownership.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the comment to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - article_id
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the comment
 *               article_id:
 *                 type: number
 *                 description: The ID of the article this comment belongs to
 *     responses:
 *       201:
 *         description: Comment updated
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only edit your own comments
 *       404:
 *         description: Article not found
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

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Partially update a comment
 *     description: Updates one or more fields of the comment identified by ID. Requires authentication and ownership.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the comment to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Optional new content
 *               article_id:
 *                 type: number
 *                 description: Optional new article ID
 *     responses:
 *       200:
 *         description: Comment updated
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only edit your own comments
 *       404:
 *         description: Article not found
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

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes the comment with the specified ID. Requires authentication and ownership.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the comment to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Comment deleted
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only delete your own comments
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
