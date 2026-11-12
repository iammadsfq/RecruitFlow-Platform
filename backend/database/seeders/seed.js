const { db } = require('../../src/config/db');
const path = require('path');
const fs = require('fs');
const csv = require('fs');

function seed() {
  console.log('[SEEDER] Memulai inisialisasi data awal RecruitFlow...');

  // 1. Admin / HR User
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES ('usr_admin_01', 'HR Recruiter Utama', 'hr@recruitflow.id', 'hash_admin123', 'HR')
    ON CONFLICT(email) DO NOTHING
  `).run();

  // 2. Lowongan Acuan Lomba: Junior Software Engineer
  const jobId = 'job_software_eng_01';
  db.prepare(`
    INSERT INTO jobs (id, title, department, description, location, quota, status, window_hours, overbooking_percent, interview_location)
    VALUES (?, 'Junior Software Engineer', 'Engineering', 'Bertanggung jawab dalam pengembangan antarmuka web modern dan integrasi API backend.', 'Jakarta Selatan (Hybrid)', 5, 'OPEN', 24, 20, 'Google Meet: https://meet.google.com/rf-demo-2026')
    ON CONFLICT(id) DO NOTHING
  `).run(jobId);

  // 3. Pertanyaan Screening Terstruktur
  db.prepare(`
    INSERT INTO screening_questions (id, job_id, question_text, question_type, options_json, is_required)
    VALUES
      ('sq_01', ?, 'Apakah Anda bersedia bekerja dengan sistem hybrid di Jakarta Selatan?', 'CHOICE', '["Ya", "Tidak"]', 1),
      ('sq_02', ?, 'Berapa tahun total pengalaman Anda menggunakan framework React?', 'NUMBER', NULL, 1)
    ON CONFLICT(id) DO NOTHING
  `).run(jobId, jobId);

  // 4. Kriteria & Syarat Mutlak Knock-Out
  db.prepare(`DELETE FROM criteria WHERE job_id = ?`).run(jobId);
  const insertCrit = db.prepare(`
    INSERT INTO criteria (id, job_id, criteria_type, value, synonyms_json, weight)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertCrit.run('crit_01', jobId, 'KNOCKOUT_PENDIDIKAN', 'S1', '["Sarjana", "Bachelor", "D4"]', 10);
  insertCrit.run('crit_02', jobId, 'KNOCKOUT_PENGALAMAN', '1.0', null, 20);
  insertCrit.run('crit_03', jobId, 'KNOCKOUT_DOMISILI', 'Jakarta,Bogor,Depok,Tangerang,Bekasi', null, 0);
  insertCrit.run('crit_04', jobId, 'SKILL_WAJIB', 'React', '["ReactJS", "React.js", "React Native"]', 15);
  insertCrit.run('crit_05', jobId, 'SKILL_WAJIB', 'Node.js', '["NodeJS", "Node", "Express"]', 15);
  insertCrit.run('crit_06', jobId, 'SKILL_WAJIB', 'SQL', '["PostgreSQL", "MySQL", "SQLite", "Database"]', 10);
  insertCrit.run('crit_07', jobId, 'SKILL_WAJIB', 'Git', '["GitHub", "GitLab", "Version Control"]', 10);
  insertCrit.run('crit_08', jobId, 'SKILL_TAMBAHAN', 'Docker', '["Container", "Docker Compose"]', 10);
  insertCrit.run('crit_09', jobId, 'SKILL_TAMBAHAN', 'TypeScript', '["TS"]', 10);

  // 5. Pewawancara & Slot Waktu
  const interviewerId = 'intv_01';
  db.prepare(`
    INSERT INTO interviewers (id, name, email, slot_duration_minutes, capacity)
    VALUES (?, 'Bambang Sutrisno (Lead Engineer)', 'bambang.lead@recruitflow.id', 30, 15)
    ON CONFLICT(id) DO NOTHING
  `).run(interviewerId);

  // Buat 10 Slot Kalender untuk 3-5 hari ke depan
  const insertSlot = db.prepare(`
    INSERT INTO slots (id, interviewer_id, start_time, end_time, status)
    VALUES (?, ?, ?, ?, 'TERSEDIA')
    ON CONFLICT(interviewer_id, start_time) DO NOTHING
  `);

  const now = new Date();
  for (let d = 1; d <= 5; d++) {
    const slotDate = new Date(now.getTime() + d * 24 * 3600 * 1000);
    const dateStr = slotDate.toISOString().split('T')[0];
    
    insertSlot.run(`slot_${d}_1`, interviewerId, `${dateStr}T09:00:00+07:00`, `${dateStr}T09:30:00+07:00`);
    insertSlot.run(`slot_${d}_2`, interviewerId, `${dateStr}T10:00:00+07:00`, `${dateStr}T10:30:00+07:00`);
    insertSlot.run(`slot_${d}_3`, interviewerId, `${dateStr}T14:00:00+07:00`, `${dateStr}T14:30:00+07:00`);
    insertSlot.run(`slot_${d}_4`, interviewerId, `${dateStr}T15:00:00+07:00`, `${dateStr}T15:30:00+07:00`);
  }

  // 6. Template Komunikasi Bawaan
  const insertTpl = db.prepare(`
    INSERT INTO message_templates (id, message_type, channel, subject, body, version)
    VALUES (?, ?, 'EMAIL', ?, ?, 1)
    ON CONFLICT(message_type) DO NOTHING
  `);

  insertTpl.run(
    'tpl_undangan', 'UNDANGAN',
    'Undangan Wawancara: {{posisi}} - {{perusahaan}}',
    'Halo {{nama}},\n\nTerima kasih telah melamar sebagai {{posisi}} di {{perusahaan}}.\nKami mengundang Anda menghadiri sesi wawancara:\n- Tanggal: {{tanggal}}\n- Waktu: {{jam}} WIB\n- Lokasi: {{lokasi}}\n- Berkas Wajib: {{dokumen}}\n- Narahubung: {{kontak}}\n\nMohon konfirmasi kehadiran sebelum {{batas_konfirmasi}} melalui tautan: {{link_konfirmasi}}.\n\nSalam Hangat,\nTim Rekrutmen'
  );

  insertTpl.run(
    'tpl_penolakan', 'PENOLAKAN',
    'Pembaruan Status Lamaran: {{posisi}} - {{perusahaan}}',
    'Halo {{nama}},\n\nTerima kasih atas minat dan usaha yang Anda luangkan dalam melamar posisi {{posisi}} di {{perusahaan}}.\nSetelah melalui peninjauan cermat, saat ini kami belum dapat melanjutkan proses seleksi Anda. Keputusan ini bukan penilaian atas kompetensi Anda secara umum.\nTetap semangat dalam perjalanan karir Anda!\n\nJika berkenan disimpan di Talent Pool: {{link_talent_pool}}'
  );

  // 7. Salin 50 Berkas Uji CV dan Masukkan ke tabel applications sebagai status 'BARU'
  const CV_SRC_DIR = path.join(__dirname, '../../../../RecruitFlow-RPA/Data/Input');
  const CSV_PATH = path.join(__dirname, '../../../../RecruitFlow-RPA/Data/kunci_jawaban.csv');
  const UPLOAD_DIR = path.join(__dirname, '../../uploads');

  if (fs.existsSync(CSV_PATH) && fs.existsSync(CV_SRC_DIR)) {
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',');

    const insertApp = db.prepare(`
      INSERT INTO applications (
        id, job_id, name, email, phone, city, education, experience_years,
        screening_answers_json, cv_file_path, status, token_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'BARU', ?)
      ON CONFLICT(id) DO NOTHING
    `);

    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      // Simple parse accounting for quotes
      const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      const parts = lines[i].split(',');
      const cid = parts[0];
      const name = parts[1];
      const email = parts[2];
      const phone = parts[3];
      const edu = parts[4];
      const exp = parseFloat(parts[5]) || 0;

      const srcPdf = path.join(CV_SRC_DIR, `${cid}.pdf`);
      const destPdf = path.join(UPLOAD_DIR, `${cid}.pdf`);
      
      if (fs.existsSync(srcPdf) && !fs.existsSync(destPdf)) {
        fs.copyFileSync(srcPdf, destPdf);
      }

      insertApp.run(
        cid,
        jobId,
        name,
        email,
        phone,
        'Jakarta',
        edu,
        exp,
        JSON.stringify({ hybrid_consent: 'Ya', react_exp: exp }),
        destPdf,
        `tok_${cid}_status`
      );
      count++;
    }
    console.log(`[SEEDER] Berhasil memuat ${count} pelamar sintetis dengan status 'BARU'`);
  }

  console.log('[SEEDER] Inisialisasi basis data selesai dengan sukses!');
}

seed();
