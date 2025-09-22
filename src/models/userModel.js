// Model User sesuai struktur tabel users
export class User {
	constructor({ id_user, nama, email, password, fakultas, semester, updated_at }) {
		this.id_user = id_user;
		this.nama = nama;
		this.email = email;
		this.password = password;
		this.fakultas = fakultas;
		this.semester = semester;
		this.updated_at = updated_at;
	}
}
