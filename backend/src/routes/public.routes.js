const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/db');

// Konfigurasi Multer untuk Unggah CV PDF
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Hanya berkas format PDF yang diperbolehkan'));
    }
    cb(null, true);
  }
});

// 1. Daftar Lowongan Terbuka
router.get('/jobs', (req, res) => {
  const stmt = db.prepare(`
    SELECT id, title, department, location, quota, interview_location, created_at
    FROM jobs
    WHERE status = 'OPEN'
    ORDER BY created_at DESC
  `);
  res.json(stmt.all());
});

// 2. Detail Lowongan & Pertanyaan Screening
router.get('/jobs/:id', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND status = "OPEN"').get(req.params.id);
  if (!job) return res.status(404).json({ code: 'NOT_FOUND', message: 'Lowongan tidak ditemukan atau sudah ditutup' });

  const questions = db.prepare('SELECT id, question_text, question_type, options_json, is_required FROM screening_questions WHERE job_id = ?').all(req.params.id);

  job.screening_questions = questions.map(q => ({
    ...q,
    options: q.options_json ? JSON.parse(q.options_json) : []
  }));

  res.json(job);
});

// 3. Pengiriman Lamaran Mandiri (Multipart Form-Data)
router.post('/applications', upload.single('cv_file'), (req, res) => {
  try {
    const { job_id, name, email, phone, city, education, experience_years, screening_answers } = req.body;

    if (!job_id || !name || !email || !phone || !city || !education || !req.file) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'Semua kolom wajib dan berkas CV PDF harus diisi' });
    }

    // Deteksi Lamaran Ganda (BR-04)
    const existing = db.prepare(`
      SELECT id, status FROM applications
      WHERE job_id = ? AND (email = ? OR phone = ?) AND status NOT IN ('DITOLAK_TERKIRIM', 'TIDAK_HADIR')
    `).get(job_id, email.trim().toLowerCase(), phone.trim());

    if (existing) {
      // Hapus berkas yang baru diunggah jika duplikat
      fs.unlinkSync(req.file.path);
      return res.status(409).json({
        code: 'DUPLICATE_APPLICATION',
        message: 'Anda sudah memiliki lamaran aktif untuk lowongan ini. Mohon pantau status lamaran Anda melalui tautan yang telah dikirimkan.'
      });
    }

    const appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tokenStatus = `tok_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

    db.prepare(`
      INSERT INTO applications (
        id, job_id, name, email, phone, city, education, experience_years,
        screening_answers_json, cv_file_path, status, token_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'BARU', ?)
    `).run(
      appId,
      job_id,
      name.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      city.trim(),
      education.trim(),
      parseFloat(experience_years) || 0,
      typeof screening_answers === 'string' ? screening_answers : JSON.stringify(screening_answers || {}),
      req.file.path,
      tokenStatus
    );

    res.status(201).json({
      success: true,
      application_id: appId,
      token_status: tokenStatus,
      message: 'Lamaran berhasil dikirim dan akan segera diproses oleh sistem otomasi.'
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
});

// 4. Pelacakan Status Lamaran Mandiri (P4 - Tanpa Membocorkan Skor Angka Internal)
router.get('/applications/:token', (req, res) => {
  const app = db.prepare(`
    SELECT a.id, a.name, a.status, a.created_at, j.title as job_title, j.department
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.token_status = ?
  `).get(req.params.token);

  if (!app) return res.status(404).json({ code: 'NOT_FOUND', message: 'Tautan status tidak valid' });

  // Peta status ramah kandidat
  const candidateStatusMap = {
    'BARU': { step: 1, label: 'Lamaran Diterima', desc: 'Berkas berhasil masuk ke antrean seleksi.' },
    'DIPROSES': { step: 2, label: 'Sedang Diverifikasi', desc: 'Sistem otomasi sedang mengevaluasi berkas Anda.' },
    'MENUNGGU_KEPUTUSAN': { step: 2, label: 'Sedang Ditinjau Tim HR', desc: 'Berkas Anda sedang dalam peninjauan oleh tim rekrutmen.' },
    'DISETUJUI_UNDANG': { step: 3, label: 'Menyiapkan Jadwal', desc: 'Tim sedang mengalokasikan slot wawancara untuk Anda.' },
    'MENUNGGU_KONFIRMASI': { step: 3, label: 'Undangan Wawancara Terbit', desc: 'Silakan konfirmasi kehadiran wawancara Anda.' },
    'TERKONFIRMASI': { step: 4, label: 'Wawancara Terjadwal', desc: 'Kehadiran Anda telah terkonfirmasi secara resmi.' },
    'TIDAK_HADIR': { step: 5, label: 'Proses Dihentikan', desc: 'Anda menyatakan berhalangan hadir pada sesi wawancara.' },
    'RESCHEDULE_DIMINTA': { step: 3, label: 'Pengajuan Jadwal Baru', desc: 'Permohonan jadwal baru Anda sedang diproses.' },
    'TIDAK_MERESPONS': { step: 5, label: 'Kedaluwarsa', desc: 'Batas waktu konfirmasi wawancara telah terlewati.' },
    'INTERVIEW_SELESAI': { step: 4, label: 'Wawancara Selesai', desc: 'Tahap wawancara telah berhasil dilaksanakan.' },
    'DITOLAK_TERKIRIM': { step: 5, label: 'Proses Selesai', desc: 'Terima kasih telah melamar. Saat ini belum dapat melanjutkan ke tahap berikutnya.' },
    'TALENT_POOL': { step: 5, label: 'Tersimpan di Talent Pool', desc: 'Data Anda disimpan untuk peluang posisi mendatang.' },
    'PERLU_DITINJAU': { step: 2, label: 'Dalam Peninjauan Khusus', desc: 'Berkas sedang diverifikasi manual oleh tim verifikator.' }
  };

  const statusInfo = candidateStatusMap[app.status] || { step: 2, label: 'Sedang Diproses', desc: 'Tahapan seleksi sedang berlangsung.' };

  res.json({
    candidate_name: app.name,
    job_title: app.job_title,
    department: app.department,
    applied_at: app.created_at,
    status_info: statusInfo
  });
});

// 5. Informasi Wawancara (P5 via Token)
router.get('/interviews/:token', (req, res) => {
  const interview = db.prepare(`
    SELECT i.id, i.status, i.hold_until, s.start_time, s.end_time,
           a.name as candidate_name, j.title as job_title, j.interview_location,
           j.documents_required, j.contact_person
    FROM interviews i
    JOIN slots s ON i.slot_id = s.id
    JOIN applications a ON i.application_id = a.id
    JOIN jobs j ON a.job_id = j.id
    WHERE i.token_confirm = ?
  `).get(req.params.token);

  if (!interview) return res.status(404).json({ code: 'NOT_FOUND', message: 'Tautan konfirmasi tidak ditemukan atau kedaluwarsa' });
  res.json(interview);
});

// 6. Konfirmasi Hadir
router.post('/interviews/:token/confirm', (req, res) => {
  const interview = db.prepare('SELECT id, slot_id, application_id, status FROM interviews WHERE token_confirm = ?').get(req.params.token);
  if (!interview) return res.status(404).json({ code: 'NOT_FOUND', message: 'Tautan tidak valid' });

  db.exec('BEGIN TRANSACTION;');
  try {
    db.prepare("UPDATE interviews SET status = 'TERKONFIRMASI', confirmed_at = CURRENT_TIMESTAMP WHERE id = ?").run(interview.id);
    db.prepare("UPDATE slots SET status = 'TERISI' WHERE id = ?").run(interview.slot_id);
    db.prepare("UPDATE applications SET status = 'TERKONFIRMASI', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(interview.application_id);
    db.exec('COMMIT;');
    res.json({ success: true, message: 'Kehadiran berhasil dikonfirmasi. Sampai jumpa di sesi wawancara!' });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
});

// 7. Menolak Wawancara
router.post('/interviews/:token/decline', (req, res) => {
  const interview = db.prepare('SELECT id, slot_id, application_id FROM interviews WHERE token_confirm = ?').get(req.params.token);
  if (!interview) return res.status(404).json({ code: 'NOT_FOUND', message: 'Tautan tidak valid' });

  db.exec('BEGIN TRANSACTION;');
  try {
    db.prepare("UPDATE interviews SET status = 'TIDAK_HADIR' WHERE id = ?").run(interview.id);
    // Bebaskan slot kalender untuk kandidat lain
    db.prepare("UPDATE slots SET status = 'TERSEDIA' WHERE id = ?").run(interview.slot_id);
    db.prepare("UPDATE applications SET status = 'TIDAK_HADIR', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(interview.application_id);
    db.exec('COMMIT;');
    res.json({ success: true, message: 'Respons Anda telah dicatat. Terima kasih telah mengabari kami.' });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
