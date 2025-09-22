import pool from "../config/db.js";

export const addMood = async (req, res) => {
  try {
    const { mood_level, emosi, catatan } = req.body;
    const id_user = req.user.id_user;

    const result = await pool.query(
      "INSERT INTO mood_logs (id_user, tanggal, mood_level, emosi, catatan) VALUES ($1, CURRENT_DATE, $2, $3, $4) RETURNING *",
      [id_user, mood_level, emosi, catatan]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMoods = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const result = await pool.query(
      "SELECT * FROM mood_logs WHERE id_user = $1 ORDER BY tanggal DESC",
      [id_user]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getWeeklyStats = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const result = await pool.query(
      `SELECT DATE_TRUNC('week', tanggal) AS minggu, AVG(mood_level) AS rata_rata 
        FROM mood_logs WHERE id_user=$1 
        GROUP BY minggu ORDER BY minggu DESC LIMIT 4`,
      [id_user]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
