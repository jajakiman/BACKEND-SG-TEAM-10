import pool from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    const hashed = await hashPassword(password);

    const result = await pool.query(
      "INSERT INTO users (nama, email, password) VALUES ($1, $2, $3) RETURNING id_user, nama, email",
      [nama, email, hashed]
    );

    res.json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });             
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid password" });

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id_user: user.id_user,
        nama: user.nama,
        email: user.email,
        fakultas: user.fakultas,
        semester: user.semester,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
