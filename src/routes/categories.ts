import { Router, Request, Response, NextFunction } from "express";
import { pool } from "../database.js";
import { ResultSetHeader } from "mysql2";
import { Category } from "../types/categories.js";
import { Article } from "../types/articles.js";
import { validateId } from "../middleware/validation.ts/validate-id.js";
import {
  validatePartialCategoryData,
  validateRequiredCategoryData,
} from "../middleware/validation.ts/validate-category-data.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Returns a list of all categories with their ID, name, and description.
 *     responses:
 *       200:
 *         description: Array of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   description:
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

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     description: Returns the category identified by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category object
 *       400:
 *         description: Invalid category ID
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

/**
 * @swagger
 * /categories/{id}/articles:
 *   get:
 *     summary: Get all articles in a category
 *     description: Returns a list of articles associated with the specified category ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of articles
 *       400:
 *         description: Invalid category ID
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

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category
 *               description:
 *                 type: string
 *                 description: Description of the category
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Missing or invalid access token
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

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     description: Replaces the category with the specified ID with new name and description. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the category
 *               description:
 *                 type: string
 *                 description: The new description of the category
 *     responses:
 *       200:
 *         description: Category updated
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

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Partially update a category
 *     description: Updates one or more fields of the category identified by ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Optional new name
 *               description:
 *                 type: string
 *                 description: Optional new description
 *     responses:
 *       200:
 *         description: Category updated
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

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Deletes the category with the specified ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted
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
