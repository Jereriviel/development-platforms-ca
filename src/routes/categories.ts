import { Router, Request, Response, NextFunction } from "express";
import { pool } from "../database.js";
import { ResultSetHeader } from "mysql2";
import { Category } from "../types/categories.js";
import { Article } from "../types/articles.js";
import { validateId } from "../middleware/validation.ts/validate-id.js";
import {
  validatePartialCategoryData,
  validateRequiredCategoryData,
} from "../middleware/validation.ts/category-data.js";
import { authenticateToken } from "../middleware/validation.ts/auth.js";

const router = Router();

// GET /categories

router.get("/categories", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, description FROM categories",
    );
    const categories = rows as Category[];

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// GET /categories/:id

router.get(
  "/categories/:id",
  validateId("Category ID"),
  async (req, res, next) => {
    try {
      const categoryId = Number(req.params.id);
      const [rows] = await pool.execute(
        "SELECT id, name, description FROM categories WHERE id = ?",
        [categoryId],
      );

      const categories = rows as Category[];

      if (categories.length === 0) {
        return next({ status: 404, message: "Category not found" });
      }

      res.json(categories[0]);
    } catch (error) {
      next(error);
    }
  },
);

// GET /categories/:id/articles

router.get(
  "/categories/:id/articles",
  validateId("Category ID"),
  async (req, res, next) => {
    try {
      const categoryId = Number(req.params.id);
      const [rows] = await pool.execute(
        `
      SELECT 
        articles.id,
        articles.title,
        articles.body,
        articles.category_id,
        articles.user_id,
        articles.created_at
      FROM articles 
      WHERE articles.category_id = ?
    `,
        [categoryId],
      );

      const articles = rows as Article[];

      res.json(articles);
    } catch (error) {
      next(error);
    }
  },
);

// POST /categories

router.post(
  "/categories",
  authenticateToken,
  validateRequiredCategoryData,
  async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const [result]: [ResultSetHeader, any] = await pool.execute(
        "INSERT INTO categories (name, description) VALUES (?, ?)",
        [name, description],
      );

      res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
      next(error);
    }
  },
);

// PUT /categories/:id

router.put(
  "/categories/:id",
  authenticateToken,
  validateId("Category ID"),
  validateRequiredCategoryData,
  async (req, res, next) => {
    try {
      const categoryId = Number(req.params.id);
      const { name, description } = req.body;
      const [result]: [ResultSetHeader, any] = await pool.execute(
        "UPDATE categories SET name = ?, description = ? WHERE id = ?",
        [name, description, categoryId],
      );

      if (result.affectedRows === 0) {
        return next({ status: 404, message: "Category not found" });
      }

      res.json({ id: categoryId, name, description });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /categories/:id

router.patch(
  "/categories/:id",
  authenticateToken,
  validateId("Category ID"),
  validatePartialCategoryData,
  async (req, res, next) => {
    try {
      const categoryId = Number(req.params.id);
      const { name, description } = req.body;
      const fieldsToUpdate = [];
      const values = [];

      if (name) {
        fieldsToUpdate.push("name = ?");
        values.push(name);
      }

      if (description) {
        fieldsToUpdate.push("description = ?");
        values.push(description);
      }

      values.push(categoryId);

      const query = `UPDATE categories SET ${fieldsToUpdate.join(
        ", ",
      )} WHERE id = ?`;
      const [result]: [ResultSetHeader, any] = await pool.execute(
        query,
        values,
      );

      if (result.affectedRows === 0) {
        return next({ status: 404, message: "Category not found" });
      }

      const [rows] = await pool.execute(
        "SELECT id, name, description FROM categories WHERE id = ?",
        [categoryId],
      );
      const categories = rows as Category[];

      res.json(categories[0]);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /categories/:id

router.delete(
  "/categories/:id",
  authenticateToken,
  validateId("Category ID"),
  async (req, res, next) => {
    try {
      const categoryId = Number(req.params.id);
      const [result]: [ResultSetHeader, any] = await pool.execute(
        "DELETE FROM categories WHERE id = ?",
        [categoryId],
      );

      if (result.affectedRows === 0) {
        return next({ status: 404, message: "Category not found" });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export const categoriesRouter = router;
