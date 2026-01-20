import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { pool } from "../database.js";
import { User, UserResponse } from "../types/users.js";
import { validateLogin } from "../middleware/validation.ts/auth.js";
import { generateToken } from "../utils/jwt.js";

const router = Router();

//Login user

router.post("/login", validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.execute(
      "SELECT id, username, email, password FROM users WHERE email = ?",
      [email],
    );
    const users = rows as User[];

    if (users.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password!);

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);
    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
});

export const loginRouter = router;
