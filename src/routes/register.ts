import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { pool } from "../database.js";
import { ResultSetHeader } from "mysql2";
import { User, UserResponse } from "../types/users.js";
import { validateRegistration } from "../middleware/validation.ts/auth.js";

const router = Router();

//Register new user

router.post("/register", validateRegistration, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username],
    );
    const existingUsers = rows as User[];

    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result]: [ResultSetHeader, any] = await pool.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
    );

    const userResponse: UserResponse = {
      id: result.insertId,
      username,
      email,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
});

export const registerRouter = router;
