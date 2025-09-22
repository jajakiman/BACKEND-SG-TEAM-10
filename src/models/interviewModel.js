// Model Interview sesuai struktur tabel interview_sessions
export class Interview {
	constructor({ id_interview, id_user, pertanyaan, jawaban_user, feedback, created_at }) {
		this.id_interview = id_interview;
		this.id_user = id_user;
		this.pertanyaan = pertanyaan;
		this.jawaban_user = jawaban_user;
		this.feedback = feedback;
		this.created_at = created_at;
	}
}
