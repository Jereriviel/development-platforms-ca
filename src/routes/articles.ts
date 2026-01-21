import { Router, Request, Response, NextFunction } from "express";
import { pool } from "../database.js";
import { ResultSetHeader } from "mysql2";
import { Article, ArticleWithNames } from "../types/articles.js";
import { CommentWithName } from "../types/comments.js";
import {
  validatePartialArticleData,
  validateRequiredArticleData,
} from "../middleware/validation.ts/article-data.js";
import { validateId } from "../middleware/validation.ts/validate-id.js";
import { authenticateToken } from "../middleware/validation.ts/auth.js";

const router = Router();

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get all articles
 *     description: Returns a list of all articles including their category and submitter information.
 *     responses:
 *       200:
 *         description: Array of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   category_id:
 *                     type: number
 *                   category_name:
 *                     type: string
 *                   submitter_id:
 *                     type: number
 *                   submitter_name:
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

router.get("/articles", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        articles.id,
        articles.title,
        articles.body,
        articles.category_id,
        categories.name AS category_name,
        articles.submitter_id,
        users.username AS submitter_name,
        articles.created_at
      FROM articles
      INNER JOIN categories ON articles.category_id = categories.id
      INNER JOIN users ON articles.submitter_id = users.id;
     `);

    const articles = rows as ArticleWithNames[];

    res.json(articles);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Get a single article by ID
 *     description: Returns the article identified by its ID, including category and submitter information.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the article to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article object
 *       400:
 *         description: Invalid article ID
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

router.get(
  "/articles/:id",
  validateId("Article ID"),
  async (req, res, next) => {
    try {
      const articleId = Number(req.params.id);
      const [rows] = await pool.execute(
        `
      SELECT 
        articles.id,
        articles.title,
        articles.body,
        articles.category_id,
        categories.name AS category_name,
        articles.submitter_id,
        users.username AS submitter_name,
        articles.created_at
      FROM articles
      INNER JOIN categories ON articles.category_id = categories.id
      INNER JOIN users ON articles.submitter_id = users.id
      WHERE articles.id = ?
      `,
        [articleId],
      );

      const articles = rows as ArticleWithNames[];

      if (articles.length === 0) {
        return next({ status: 404, message: "Article not found" });
      }

      const article = articles[0];

      res.json(article);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /articles/{id}/comments:
 *   get:
 *     summary: Get comments for an article
 *     description: Returns a list of all comments associated with the specified article ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the article whose comments are being requested
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of comments
 *       400:
 *         description: Invalid article ID
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
  "/articles/:id/comments",
  validateId("Article ID"),
  async (req, res, next) => {
    try {
      const articleId = Number(req.params.id);
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
        WHERE comments.article_id = ?
      `,
        [articleId],
      );

      const comments = rows as CommentWithName[];

      res.json(comments);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     description: Creates a new article submitted by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - category_id
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the article
 *               body:
 *                 type: string
 *                 description: The content of the article
 *               category_id:
 *                 type: number
 *                 description: The ID of the category the article belongs to
 *     responses:
 *       201:
 *         description: Article created
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Category not found
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
  "/articles/",
  authenticateToken,
  validateRequiredArticleData,
  async (req, res, next) => {
    try {
      const submitterId = req.user!.id;
      const { title, body, category_id } = req.body;
      const [categoryRows] = await pool.execute(
        "SELECT id FROM categories WHERE id = ?",
        [category_id],
      );

      if ((categoryRows as any[]).length === 0) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      const [result]: [ResultSetHeader, any] = await pool.execute(
        "INSERT INTO articles (title, body, category_id, submitter_id) VALUES (?, ?, ?, ?)",
        [title, body, category_id, submitterId],
      );

      res.status(201).json({
        id: result.insertId,
        title,
        body,
        category_id,
        submitter_id: submitterId,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Update an article
 *     description: Replaces the article with the specified ID with new title, body, and category values. Only the authenticated submitter can delete.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the article to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - category_id
 *             properties:
 *               title:
 *                 type: string
 *                 description: The new title of the article
 *               body:
 *                 type: string
 *                 description: The new content of the article
 *               category_id:
 *                 type: number
 *                 description: The new category ID
 *     responses:
 *       201:
 *         description: Article updated
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only edit your own articles
 *       404:
 *         description: Category not found
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
  "/articles/:id",
  authenticateToken,
  validateId("Article ID"),
  validateRequiredArticleData,
  async (req, res, next) => {
    try {
      const articleId = Number(req.params.id);
      const submitterId = req.user!.id;
      const { title, body, category_id } = req.body;
      const [categoryRows] = await pool.execute(
        "SELECT id FROM categories WHERE id = ?",
        [category_id],
      );

      if ((categoryRows as any[]).length === 0) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      const [result]: [ResultSetHeader, any] = await pool.execute(
        "UPDATE articles SET title = ?, body = ?, category_id = ? WHERE id = ? AND submitter_id = ?",
        [title, body, category_id, articleId, submitterId],
      );

      if (result.affectedRows === 0) {
        return res.status(403).json({
          message: "You can only edit your own articles",
        });
      }

      res.status(201).json({
        id: articleId,
        title,
        body,
        category_id,
        submitter_id: submitterId,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /articles/{id}:
 *   patch:
 *     summary: Partially update an article
 *     description: Updates one or more fields of the article identified by ID. Only the authenticated submitter can update.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the article to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Optional new title
 *               body:
 *                 type: string
 *                 description: Optional new content
 *               category_id:
 *                 type: number
 *                 description: Optional new category ID
 *     responses:
 *       200:
 *         description: Article updated
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only edit your own articles
 *       404:
 *         description: Category not found
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
  "/articles/:id",
  authenticateToken,
  validateId("Article ID"),
  validatePartialArticleData,
  async (req, res, next) => {
    try {
      const articleId = Number(req.params.id);
      const submitterId = req.user!.id;
      const { title, body, category_id } = req.body;
      const fieldsToUpdate = [];
      const values = [];

      if (title) {
        fieldsToUpdate.push("title = ?");
        values.push(title);
      }

      if (body) {
        fieldsToUpdate.push("body = ?");
        values.push(body);
      }

      if (category_id !== undefined) {
        const [categoryRows] = await pool.execute(
          "SELECT id FROM categories WHERE id = ?",
          [category_id],
        );

        if ((categoryRows as any[]).length === 0) {
          return res.status(404).json({
            message: "Category not found",
          });
        }

        fieldsToUpdate.push("category_id = ?");
        values.push(category_id);
      }

      values.push(articleId, submitterId);

      const query = `UPDATE articles SET ${fieldsToUpdate.join(
        ", ",
      )} WHERE id = ? AND submitter_id = ?`;

      const [result]: [ResultSetHeader, any] = await pool.execute(
        query,
        values,
      );

      if (result.affectedRows === 0) {
        return res.status(403).json({
          message: "You can only edit your own articles",
        });
      }

      const [rows] = await pool.execute("SELECT * FROM articles WHERE id = ?", [
        articleId,
      ]);

      const articles = rows as Article[];

      res.json(articles[0]);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete an article
 *     description: Deletes the article with the specified ID. Only the authenticated submitter can delete.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the article to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Article deleted
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: You can only delete your own articles
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
  "/articles/:id",
  authenticateToken,
  validateId("Article ID"),
  async (req, res, next) => {
    try {
      const articleId = Number(req.params.id);
      const submitterId = req.user!.id;
      const [result]: [ResultSetHeader, any] = await pool.execute(
        "DELETE FROM articles WHERE id = ? AND submitter_id = ?",
        [articleId, submitterId],
      );

      if (result.affectedRows === 0) {
        return res.status(403).json({
          message: "You can only delete your own articles",
        });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export const articlesRouter = router;
