// test.js
const client = require('./db');

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Berhasil connect ke PostgreSQL!');

    const res = await client.query('SELECT NOW() AS waktu_sekarang;');
    console.log('🕒 Waktu server:', res.rows[0].waktu_sekarang);

    await client.end();
    console.log('🔌 Koneksi ditutup.');
  } catch (err) {
    console.error('❌ Gagal connect:', err.message);
  }
}

testConnection();