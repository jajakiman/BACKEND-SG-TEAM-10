import pool from "../config/db.js";

export const getUserProfile = async (req, res) => {
  try {
    const id_user = req.params.id;
    const result = await pool.query("SELECT * FROM users WHERE id_user = $1", [id_user]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const id_user = req.params.id;
    const { nama, fakultas, semester } = req.body;

    const result = await pool.query(
      "UPDATE users SET nama=$1, fakultas=$2, semester=$3, updated_at=NOW() WHERE id_user=$4 RETURNING *",
      [nama, fakultas, semester, id_user]
    );

    res.json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
