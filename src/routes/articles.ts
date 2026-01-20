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

//GET /articles

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

//GET /articles/:id

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
        return next({ status: 404, message: "article not found" });
      }

      const article = articles[0];

      res.json(article);
    } catch (error) {
      next(error);
    }
  },
);

//GET /articles/:id/comments

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

//POST /articles

router.post(
  "/articles/",
  authenticateToken,
  validateRequiredArticleData,
  async (req, res, next) => {
    try {
      const submitterId = req.user!.id;
      const { title, body, category_id } = req.body;
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

//PUT /articles/:id

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

//PATCH /articles/:id

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

      if (category_id) {
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

//DELETE /articles/:id

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
