import pool from "../config/db.js";

export const addJournal = async (req, res) => {
  try {
    const { isi_catatan } = req.body;
    const id_user = req.user.id_user;

    const result = await pool.query(
      "INSERT INTO journals (id_user, tanggal, isi_catatan) VALUES ($1, CURRENT_DATE, $2) RETURNING *",
      [id_user, isi_catatan]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getJournals = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const result = await pool.query(
      "SELECT * FROM journals WHERE id_user = $1 ORDER BY tanggal DESC",
      [id_user]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { isi_catatan } = req.body;

    const result = await pool.query(
      "UPDATE journals SET isi_catatan=$1, updated_at=NOW() WHERE id_journal=$2 RETURNING *",
      [isi_catatan, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM journals WHERE id_journal=$1", [id]);
    res.json({ success: true, message: "Journal deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
