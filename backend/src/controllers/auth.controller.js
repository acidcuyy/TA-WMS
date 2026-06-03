import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../middlewares/error.middleware.js";

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Harap masukkan email dan password", 400));
  }

  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND pass = $2",
    [email, password]
  );

  if (rows.length === 0) {
    return next(new AppError("Email atau password salah", 401));
  }

  const user = rows[0];
  
  // Buat token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPRES_IN || "1d" }
  );

  // Jangan kirim password kembali ke client
  const { pass, ...userWithoutPass } = user;

  res.status(200).json({
    status: "success",
    token,
    user: userWithoutPass
  });
});
