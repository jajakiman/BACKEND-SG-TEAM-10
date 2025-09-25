// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // ✅ tambahkan CORS untuk frontend

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // izinkan frontend akses API
app.use(express.json());

// Konfigurasi koneksi database
const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'eisd_10',
  password: '',
  port: 5432,
});

// Route dasar
app.get('/', (req, res) => {
  res.json({ message: "✅ Server API jalan!" });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH & USER ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ POST /auth/register
app.post('/auth/register', async (req, res) => {
  try {
    const { nama, email, password, fakultas, semester } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
    }

    const existing = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const result = await db.query(
      'INSERT INTO "User" (nama, email, password, fakultas, semester) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nama, email, password, fakultas || null, semester || null]
    );

    const { password: _, ...userWithoutPassword } = result.rows[0];
    res.status(201).json({ message: 'Registrasi berhasil', user: userWithoutPassword });

  } catch (err) {
    console.error('❌ Error di /auth/register:', err);
    res.status(500).json({ error: 'Gagal mendaftar' });
  }
});

// ✅ POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    const result = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: 'Login berhasil', user: userWithoutPassword });

  } catch (err) {
    console.error('❌ Error di /auth/login:', err);
    res.status(500).json({ error: 'Gagal login' });
  }
});

// ✅ POST /auth/google (dummy)
app.post('/auth/google', async (req, res) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ error: 'Google token diperlukan' });
    }

    // Dummy: anggap login berhasil, buat user palsu
    const dummyUser = {
      id_user: 999,
      nama: "Google User",
      email: "google.user@example.com",
      fakultas: "Ilmu Komputer",
      semester: 1
    };

    res.status(200).json({ message: 'Login via Google berhasil', user: dummyUser });
  } catch (err) {
    console.error('❌ Error di /auth/google:', err);
    res.status(500).json({ error: 'Gagal login via Google' });
  }
});

// ✅ POST /auth/forgot-password (basic flow)
app.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email wajib diisi' });
    }

    const result = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Tetap kirim success untuk keamanan (hindari email enumeration)
      return res.status(200).json({ message: 'Jika email terdaftar, instruksi reset telah dikirim' });
    }

    // Di MVP: hanya log, tidak kirim email beneran
    console.log(`📧 [DUMMY] Email reset dikirim ke: ${email}`);
    res.status(200).json({ message: 'Jika email terdaftar, instruksi reset telah dikirim' });

  } catch (err) {
    console.error('❌ Error di /auth/forgot-password:', err);
    res.status(500).json({ error: 'Gagal memproses reset password' });
  }
});

// ✅ GET /users/:id
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id_user, nama, email, fakultas, semester, created_at FROM "User" WHERE id_user = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error di GET /users/:id:', err);
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

// ✅ PUT /users/:id
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, fakultas, semester } = req.body;
    if (!nama) {
      return res.status(400).json({ error: 'Nama wajib diisi' });
    }

    const result = await db.query(
      'UPDATE "User" SET nama = $1, fakultas = $2, semester = $3 WHERE id_user = $4 RETURNING *',
      [nama, fakultas || null, semester || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const { password: _, ...updatedUser } = result.rows[0];
    res.status(200).json({ message: 'Profil berhasil diperbarui', user: updatedUser });

  } catch (err) {
    console.error('❌ Error di PUT /users/:id:', err);
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 😊 MOOD TRACKER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ POST /moods
app.post('/moods', async (req, res) => {
  try {
    const { id_user, tanggal, mood_level, emosi, catatan } = req.body;
    if (!id_user || !tanggal || mood_level === undefined) {
      return res.status(400).json({ error: 'id_user, tanggal, dan mood_level wajib diisi' });
    }
    if (mood_level < 1 || mood_level > 10) {
      return res.status(400).json({ error: 'mood_level harus antara 1-10' });
    }

    const result = await db.query(
      'INSERT INTO "MoodLog" (id_user, tanggal, mood_level, emosi, catatan) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id_user, tanggal, mood_level, emosi || null, catatan || null]
    );

    res.status(201).json({ message: 'Mood log berhasil disimpan', mood: result.rows[0] });

  } catch (err) {
    console.error('❌ Error di POST /moods:', err);
    res.status(500).json({ error: 'Gagal menyimpan mood' });
  }
});

// ✅ GET /moods
app.get('/moods', async (req, res) => {
  try {
    const { id_user, start, end } = req.query;
    if (!id_user) {
      return res.status(400).json({ error: 'id_user wajib di query params' });
    }

    let query = 'SELECT * FROM "MoodLog" WHERE id_user = $1';
    let params = [id_user];

    if (start && end) {
      query += ' AND tanggal BETWEEN $2 AND $3 ORDER BY tanggal DESC';
      params = [id_user, start, end];
    } else {
      query += ' ORDER BY tanggal DESC';
    }

    const result = await db.query(query, params);
    res.status(200).json(result.rows);

  } catch (err) {
    console.error('❌ Error di GET /moods:', err);
    res.status(500).json({ error: 'Gagal mengambil data mood' });
  }
});

// ✅ GET /moods/stats
app.get('/moods/stats', async (req, res) => {
  try {
    const { id_user } = req.query;
    if (!id_user) {
      return res.status(400).json({ error: 'id_user wajib di query params' });
    }

    const result = await db.query(
      `SELECT 
        AVG(mood_level)::numeric(10,2) AS average_mood,
        COUNT(*) AS total_entries,
        MODE() WITHIN GROUP (ORDER BY emosi) AS most_common_emotion
       FROM "MoodLog" 
       WHERE id_user = $1`,
      [id_user]
    );

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('❌ Error di GET /moods/stats:', err);
    res.status(500).json({ error: 'Gagal mengambil statistik mood' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📓 JOURNALING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ POST /journals
app.post('/journals', async (req, res) => {
  try {
    const { id_user, tanggal, isi_catatan } = req.body;
    if (!id_user || !tanggal || !isi_catatan) {
      return res.status(400).json({ error: 'id_user, tanggal, dan isi_catatan wajib diisi' });
    }

    const result = await db.query(
      'INSERT INTO "Journal" (id_user, tanggal, isi_catatan) VALUES ($1, $2, $3) RETURNING *',
      [id_user, tanggal, isi_catatan]
    );

    res.status(201).json({ message: 'Catatan berhasil disimpan', journal: result.rows[0] });

  } catch (err) {
    console.error('❌ Error di POST /journals:', err);
    res.status(500).json({ error: 'Gagal menyimpan catatan' });
  }
});

// ✅ GET /journals
app.get('/journals', async (req, res) => {
  try {
    const { id_user } = req.query;
    if (!id_user) {
      return res.status(400).json({ error: 'id_user wajib di query params' });
    }

    const result = await db.query(
      'SELECT * FROM "Journal" WHERE id_user = $1 ORDER BY tanggal DESC',
      [id_user]
    );
    res.status(200).json(result.rows);

  } catch (err) {
    console.error('❌ Error di GET /journals:', err);
    res.status(500).json({ error: 'Gagal mengambil catatan' });
  }
});

// ✅ GET /journals/:id
app.get('/journals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM "Journal" WHERE id_journal = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('❌ Error di GET /journals/:id:', err);
    res.status(500).json({ error: 'Gagal mengambil detail catatan' });
  }
});

// ✅ PUT /journals/:id
app.put('/journals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isi_catatan } = req.body;
    if (!isi_catatan) {
      return res.status(400).json({ error: 'isi_catatan wajib diisi' });
    }

    const result = await db.query(
      'UPDATE "Journal" SET isi_catatan = $1 WHERE id_journal = $2 RETURNING *',
      [isi_catatan, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }

    res.status(200).json({ message: 'Catatan berhasil diperbarui', journal: result.rows[0] });

  } catch (err) {
    console.error('❌ Error di PUT /journals/:id:', err);
    res.status(500).json({ error: 'Gagal memperbarui catatan' });
  }
});

// ✅ DELETE /journals/:id
app.delete('/journals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM "Journal" WHERE id_journal = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }

    res.status(200).json({ message: 'Catatan berhasil dihapus' });

  } catch (err) {
    console.error('❌ Error di DELETE /journals/:id:', err);
    res.status(500).json({ error: 'Gagal menghapus catatan' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💬 INTERVIEW PRACTICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Daftar pertanyaan dummy
const INTERVIEW_QUESTIONS = [
  "Ceritakan tentang diri Anda.",
  "Apa kelebihan dan kekurangan Anda?",
  "Mengapa Anda ingin bekerja di perusahaan ini?",
  "Bagaimana Anda menghadapi tekanan?",
  "Apa tujuan karir Anda dalam 5 tahun?"
];

// ✅ POST /interviews/session
app.post('/interviews/session', async (req, res) => {
  try {
    const { id_user, topik } = req.body;
    if (!id_user) {
      return res.status(400).json({ error: 'id_user wajib diisi' });
    }

    // Pilih pertanyaan acak
    const randomQuestion = INTERVIEW_QUESTIONS[Math.floor(Math.random() * INTERVIEW_QUESTIONS.length)];

    const result = await db.query(
      'INSERT INTO "InterviewSession" (id_user, tanggal, pertanyaan, topik) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_user, new Date(), randomQuestion, topik || 'Umum']
    );

    res.status(201).json({
      message: 'Sesi interview berhasil dibuat',
      session: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error di POST /interviews/session:', err);
    res.status(500).json({ error: 'Gagal membuat sesi interview' });
  }
});

// ✅ GET /interviews/session/:id
app.get('/interviews/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM "InterviewSession" WHERE id_session = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sesi interview tidak ditemukan' });
    }
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('❌ Error di GET /interviews/session/:id:', err);
    res.status(500).json({ error: 'Gagal mengambil sesi interview' });
  }
});

// ✅ POST /interviews/session/:id/answer
app.post('/interviews/session/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { jawaban_user } = req.body;

    if (!jawaban_user) {
      return res.status(400).json({ error: 'jawaban_user wajib diisi' });
    }

    // Feedback rule-based sederhana
    const feedback = jawaban_user.length > 20 
      ? "Jawaban bagus! Cukup detail." 
      : "Coba berikan jawaban yang lebih lengkap.";

    const result = await db.query(
      'UPDATE "InterviewSession" SET jawaban_user = $1, feedback = $2 WHERE id_session = $3 RETURNING *',
      [jawaban_user, feedback, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sesi interview tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Jawaban berhasil disimpan',
      session: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error di POST /answer:', err);
    res.status(500).json({ error: 'Gagal menyimpan jawaban' });
  }
});

// ✅ GET /interviews/history
app.get('/interviews/history', async (req, res) => {
  try {
    const { id_user } = req.query;
    if (!id_user) {
      return res.status(400).json({ error: 'id_user wajib di query params' });
    }

    const result = await db.query(
      'SELECT * FROM "InterviewSession" WHERE id_user = $1 ORDER BY tanggal DESC',
      [id_user]
    );
    res.status(200).json(result.rows);

  } catch (err) {
    console.error('❌ Error di GET /interviews/history:', err);
    res.status(500).json({ error: 'Gagal mengambil riwayat interview' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 JALANKAN SERVER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.listen(PORT, async () => {
  try {
    await db.query('SELECT NOW()');
    console.log('✅ Berhasil connect ke PostgreSQL');
    console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Gagal connect ke database:', err.message);
    process.exit(1);
  }
});