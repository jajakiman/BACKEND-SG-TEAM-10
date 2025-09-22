// Model Journal sesuai struktur tabel journals
export class Journal {
	constructor({ id_journal, id_user, tanggal, isi_catatan, updated_at }) {
		this.id_journal = id_journal;
		this.id_user = id_user;
		this.tanggal = tanggal;
		this.isi_catatan = isi_catatan;
		this.updated_at = updated_at;
	}
}
