import pool from "../config/db.js";

export const addInterview = async (req, res) => {
  try {
    const { pertanyaan, jawaban_user } = req.body;
    const id_user = req.user.id_user;

    let feedback = "Jawaban cukup baik, coba lebih detail.";
    if (jawaban_user.toLowerCase().includes("team")) {
      feedback = "Bagus! kamu menekankan teamwork 👍";
    }

    const result = await pool.query(
      "INSERT INTO interview_sessions (id_user, pertanyaan, jawaban_user, feedback) VALUES ($1, $2, $3, $4) RETURNING *",
      [id_user, pertanyaan, jawaban_user, feedback]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const result = await pool.query(
      "SELECT * FROM interview_sessions WHERE id_user = $1 ORDER BY created_at DESC",
      [id_user]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
