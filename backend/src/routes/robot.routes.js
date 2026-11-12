const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { db } = require('../config/db');
const { robotAuth } = require('../middleware/auth');

router.use(robotAuth);

// 1. Heartbeat
router.get('/heartbeat', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.post('/heartbeat', (req, res) => {
  const { process, version, status, tasks } = req.body;
  const stmt = db.prepare(`
    INSERT INTO heartbeats (process_name, package_version, last_seen, task_count, status)
    VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)
    ON CONFLICT(process_name) DO UPDATE SET
      package_version = excluded.package_version,
      last_seen = CURRENT_TIMESTAMP,
      task_count = excluded.task_count,
      status = excluded.status
  `);
  stmt.run(process || 'UNKNOWN_PROCESS', version || '1.0.0', tasks || 0, status || 'ACTIVE');
  res.json({ success: true });
});

// 2. Applications (Pengambilan antrean pelamar)
router.get('/applications', (req, res) => {
  const status = req.query.status || 'BARU';
  const limit = parseInt(req.query.limit, 10) || 50;

  const stmt = db.prepare(`
    SELECT id, job_id, name, email, phone, city, education, experience_years, status, created_at
    FROM applications
    WHERE status = ?
    ORDER BY created_at ASC
    LIMIT ?
  `);
  const rows = stmt.all(status, limit);
  res.json(rows);
});

// Claim lamaran (Idempotent: mengubah BARU -> DIPROSES)
router.post('/applications/:id/claim', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare(`
    UPDATE applications
    SET status = 'DIPROSES', claimed_by_robot = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'BARU'
  `);
  const result = stmt.run(id);

  if (result.changes === 0) {
    const check = db.prepare('SELECT status FROM applications WHERE id = ?').get(id);
    if (!check) return res.status(404).json({ code: 'NOT_FOUND', message: 'Lamaran tidak ditemukan' });
    if (check.status === 'DIPROSES') return res.json({ success: true, message: 'Sudah diklaim sebelumnya' });
    return res.status(409).json({ code: 'CONFLICT', message: `Status lamaran saat ini: ${check.status}` });
  }

  res.json({ success: true, status: 'DIPROSES' });
});

router.get('/applications/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!stmt) return res.status(404).json({ code: 'NOT_FOUND', message: 'Lamaran tidak ditemukan' });
  
  if (stmt.screening_answers_json) {
    stmt.screening_answers = JSON.parse(stmt.screening_answers_json);
  }
  res.json(stmt);
});

// Unduh fisik berkas PDF CV
router.get('/applications/:id/cv', (req, res) => {
  const app = db.prepare('SELECT cv_file_path FROM applications WHERE id = ?').get(req.params.id);
  if (!app || !app.cv_file_path) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Berkas CV tidak terdaftar' });
  }

  const resolvedPath = path.resolve(app.cv_file_path);
  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).json({ code: 'FILE_NOT_FOUND', message: 'Berkas fisik CV tidak ditemukan di disk' });
  }

  res.sendFile(resolvedPath);
});

// 3. Kriteria Lowongan
router.get('/jobs/:jobId/criteria', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.jobId);
  if (!job) return res.status(404).json({ code: 'NOT_FOUND', message: 'Lowongan tidak ditemukan' });

  const criteriaRows = db.prepare('SELECT * FROM criteria WHERE job_id = ?').all(req.params.jobId);

  const criteriaPayload = {
    job_id: job.id,
    title: job.title,
    quota: job.quota,
    knockout: {
      min_education: 'S1',
      min_experience_years: 1.0,
      allowed_cities: ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi'],
      require_relocation: true
    },
    weights: {
      required_skills: 50,
      preferred_skills: 20,
      experience: 20,
      education: 10
    },
    required_skills: [],
    preferred_skills: [],
    synonyms: {}
  };

  for (const c of criteriaRows) {
    if (c.criteria_type === 'KNOCKOUT_PENDIDIKAN') criteriaPayload.knockout.min_education = c.value;
    if (c.criteria_type === 'KNOCKOUT_PENGALAMAN') criteriaPayload.knockout.min_experience_years = parseFloat(c.value);
    if (c.criteria_type === 'KNOCKOUT_DOMISILI') criteriaPayload.knockout.allowed_cities = c.value.split(',').map(s => s.trim());
    if (c.criteria_type === 'SKILL_WAJIB') {
      criteriaPayload.required_skills.push(c.value);
      if (c.synonyms_json) criteriaPayload.synonyms[c.value] = JSON.parse(c.synonyms_json);
    }
    if (c.criteria_type === 'SKILL_TAMBAHAN') {
      criteriaPayload.preferred_skills.push(c.value);
      if (c.synonyms_json) criteriaPayload.synonyms[c.value] = JSON.parse(c.synonyms_json);
    }
  }

  res.json(criteriaPayload);
});

// 4. Ekstraksi & Skoring
router.post('/applications/:id/extraction', (req, res) => {
  const { text_content, parsed_data, confidence } = req.body;
  const stmt = db.prepare(`
    INSERT INTO extractions (id, application_id, text_content, parsed_data_json, confidence, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(application_id) DO UPDATE SET
      text_content = excluded.text_content,
      parsed_data_json = excluded.parsed_data_json,
      confidence = excluded.confidence
  `);
  stmt.run(`ext_${req.params.id}`, req.params.id, text_content || '', JSON.stringify(parsed_data || {}), confidence || 1.0);
  res.json({ success: true });
});

router.post('/applications/:id/score', (req, res) => {
  const { score, group, breakdown, summary, confidence, flags, is_knockout_failed, knockout_reason } = req.body;
  const stmt = db.prepare(`
    UPDATE applications
    SET score = ?,
        group_label = ?,
        score_breakdown_json = ?,
        summary = ?,
        confidence = ?,
        is_knockout_failed = ?,
        knockout_reason = ?,
        status = 'MENUNGGU_KEPUTUSAN',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    score || 0,
    group || 'PERLU_DICEK',
    JSON.stringify(breakdown || []),
    summary || '',
    confidence || 1.0,
    is_knockout_failed ? 1 : 0,
    knockout_reason || null,
    req.params.id
  );
  res.json({ success: true, status: 'MENUNGGU_KEPUTUSAN' });
});

router.post('/applications/:id/error', (req, res) => {
  const { reason, details } = req.body;
  db.prepare(`
    UPDATE applications
    SET status = 'PERLU_DITINJAU',
        summary = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(`Pengecualian Robot: ${reason}`, req.params.id);

  db.prepare(`
    INSERT INTO robot_logs (process_name, application_id, log_level, event_name, details)
    VALUES ('RF_CV_Screening', ?, 'WARN', 'BUSINESS_EXCEPTION', ?)
  `).run(req.params.id, details || reason);

  res.json({ success: true, status: 'PERLU_DITINJAU' });
});

// 5. Messaging (Penegakan BR-01: hanya untuk yang disetujui HR)
router.get('/messages', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  const stmt = db.prepare(`
    SELECT m.id, m.application_id, m.message_type, m.channel, m.status, m.payload_json
    FROM messages m
    JOIN applications a ON m.application_id = a.id
    WHERE m.status = 'PENDING'
      AND a.status IN ('DISETUJUI_UNDANG', 'DISETUJUI_TOLAK', 'MENUNGGU_KONFIRMASI', 'TERKONFIRMASI')
    LIMIT ?
  `);
  const rows = stmt.all(limit);
  res.json(rows.map(r => ({ ...r, payload: JSON.parse(r.payload_json) })));
});

router.post('/messages/:id/claim', (req, res) => {
  const stmt = db.prepare(`
    UPDATE messages
    SET status = 'SENDING'
    WHERE id = ? AND status = 'PENDING'
  `);
  const result = stmt.run(req.params.id);
  if (result.changes === 0) {
    return res.status(409).json({ code: 'ALREADY_CLAIMED', message: 'Pesan telah diklaim atau terkirim' });
  }
  res.json({ success: true, status: 'SENDING' });
});

router.get('/messages/:id', (req, res) => {
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!msg) return res.status(404).json({ code: 'NOT_FOUND', message: 'Pesan tidak ditemukan' });
  msg.payload = JSON.parse(msg.payload_json);
  res.json(msg);
});

router.post('/messages/:id/result', (req, res) => {
  const { status, error } = req.body;
  db.prepare(`
    UPDATE messages
    SET status = ?, error_message = ?, sent_at = CASE WHEN ? = 'SENT' THEN CURRENT_TIMESTAMP ELSE NULL END
    WHERE id = ?
  `).run(status, error || null, status, req.params.id);

  // Jika penolakan terkirim, update status kandidat ke DITOLAK_TERKIRIM
  const msg = db.prepare('SELECT application_id, message_type FROM messages WHERE id = ?').get(req.params.id);
  if (msg && msg.message_type === 'PENOLAKAN' && status === 'SENT') {
    db.prepare("UPDATE applications SET status = 'DITOLAK_TERKIRIM', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(msg.application_id);
  }

  res.json({ success: true });
});

// 6. Scheduling & Slot Concurrency (Mitigasi Bentrok 409)
router.get('/interviews/pending-assignment', (req, res) => {
  const stmt = db.prepare(`
    SELECT a.id as application_id, a.job_id, a.name, a.email, a.phone
    FROM applications a
    LEFT JOIN interviews i ON a.id = i.application_id
    WHERE a.status = 'DISETUJUI_UNDANG' AND i.id IS NULL
    ORDER BY a.updated_at ASC
  `);
  res.json(stmt.all());
});

router.get('/slots', (req, res) => {
  const stmt = db.prepare(`
    SELECT s.id, s.interviewer_id, i.name as interviewer_name, s.start_time, s.end_time, s.status
    FROM slots s
    JOIN interviewers i ON s.interviewer_id = i.id
    WHERE s.status = 'TERSEDIA' AND s.start_time > datetime('now', '+2 hours')
    ORDER BY s.start_time ASC
  `);
  res.json(stmt.all());
});

router.post('/interviews', (req, res) => {
  const { application_id, slot_id, hold_until } = req.body;

  // Transaksi Atomik Kunci Slot
  db.exec('BEGIN TRANSACTION;');
  try {
    const slot = db.prepare("SELECT status FROM slots WHERE id = ?").get(slot_id);
    if (!slot || slot.status !== 'TERSEDIA') {
      db.exec('ROLLBACK;');
      return res.status(409).json({ code: 'SLOT_TAKEN', message: 'Slot kalender sudah diambil oleh kandidat lain' });
    }

    // Ubah slot ke DITAHAN
    db.prepare("UPDATE slots SET status = 'DITAHAN' WHERE id = ?").run(slot_id);

    const interviewId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tokenConfirm = `tok_int_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const holdTime = hold_until || new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    db.prepare(`
      INSERT INTO interviews (id, application_id, slot_id, status, hold_until, token_confirm)
      VALUES (?, ?, ?, 'MENUNGGU_KONFIRMASI', ?, ?)
    `).run(interviewId, application_id, slot_id, holdTime, tokenConfirm);

    db.prepare("UPDATE applications SET status = 'MENUNGGU_KONFIRMASI', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(application_id);

    // Buat Pesan Undangan Otomatis di tabel messages
    const app = db.prepare('SELECT name, email, phone, job_id FROM applications WHERE id = ?').get(application_id);
    const job = db.prepare('SELECT title, interview_location, documents_required, contact_person FROM jobs WHERE id = ?').get(app.job_id);
    const slotInfo = db.prepare('SELECT start_time FROM slots WHERE id = ?').get(slot_id);

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `INVITATION_${application_id}_v1`;

    const payload = {
      to_email: app.email,
      to_name: app.name,
      position: job.title,
      company: 'PT RecruitFlow Inovasi',
      date: slotInfo.start_time.split('T')[0] || slotInfo.start_time.split(' ')[0],
      time: slotInfo.start_time.split('T')[1]?.substring(0, 5) || '10:00',
      location: job.interview_location,
      documents: job.documents_required,
      contact: job.contact_person,
      link_confirm: `http://localhost:3000/interview/${tokenConfirm}`,
      deadline: holdTime
    };

    db.prepare(`
      INSERT INTO messages (id, application_id, message_type, channel, status, payload_json, idempotency_key)
      VALUES (?, ?, 'UNDANGAN', 'EMAIL', 'PENDING', ?, ?)
      ON CONFLICT(idempotency_key) DO NOTHING
    `).run(messageId, application_id, JSON.stringify(payload), idempotencyKey);

    db.exec('COMMIT;');
    res.status(201).json({ success: true, interview_id: interviewId, token_confirm: tokenConfirm });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
});

// Pelepasan Slot
router.post('/interviews/:id/release', (req, res) => {
  const interview = db.prepare('SELECT slot_id FROM interviews WHERE id = ?').get(req.params.id);
  if (interview) {
    db.prepare("UPDATE slots SET status = 'TERSEDIA' WHERE id = ?").run(interview.slot_id);
    db.prepare("DELETE FROM interviews WHERE id = ?").run(req.params.id);
  }
  res.json({ success: true });
});

// 7. Pengingat H-1
router.get('/interviews/due-reminder', (req, res) => {
  const targetDate = req.query.date || new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const stmt = db.prepare(`
    SELECT i.id as interview_id, i.application_id, s.start_time, a.name, a.email, j.title, j.interview_location
    FROM interviews i
    JOIN slots s ON i.slot_id = s.id
    JOIN applications a ON i.application_id = a.id
    JOIN jobs j ON a.job_id = j.id
    WHERE i.status = 'TERKONFIRMASI'
      AND s.start_time LIKE ?
  `);
  res.json(stmt.all(`${targetDate}%`));
});

// 8. Pelaporan Harian
router.get('/reports/daily', (req, res) => {
  const totalApps = db.prepare('SELECT COUNT(*) as count FROM applications').get().count;
  const groups = db.prepare('SELECT group_label, COUNT(*) as count FROM applications GROUP BY group_label').all();
  const stages = db.prepare('SELECT status, COUNT(*) as count FROM applications GROUP BY status').all();
  const confirmed = db.prepare("SELECT COUNT(*) as count FROM interviews WHERE status = 'TERKONFIRMASI'").get().count;

  res.json({
    generated_at: new Date().toISOString(),
    total_applications: totalApps,
    confirmed_interviews: confirmed,
    group_distribution: groups,
    stage_breakdown: stages
  });
});

router.post('/reports', (req, res) => {
  res.json({ success: true, message: 'Laporan harian tercatat' });
});

// 9. Telemetri Log Robot
router.post('/logs', (req, res) => {
  const { process, job_id, application_id, message_id, level, event, details } = req.body;
  db.prepare(`
    INSERT INTO robot_logs (process_name, job_id, application_id, message_id, log_level, event_name, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    process || 'ROBOT_GENERAL',
    job_id || null,
    application_id || null,
    message_id || null,
    level || 'INFO',
    event || 'EVENT',
    typeof details === 'object' ? JSON.stringify(details) : (details || '')
  );
  res.json({ success: true });
});

module.exports = router;
