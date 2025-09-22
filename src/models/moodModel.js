// Model Mood sesuai struktur tabel mood_logs
export class Mood {
	constructor({ id_mood, id_user, tanggal, mood_level, emosi, catatan }) {
		this.id_mood = id_mood; // opsional, jika ada primary key id_mood
		this.id_user = id_user;
		this.tanggal = tanggal;
		this.mood_level = mood_level;
		this.emosi = emosi;
		this.catatan = catatan;
	}
}
