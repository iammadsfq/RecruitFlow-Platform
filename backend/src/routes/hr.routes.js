const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { staffAuth } = require('../middleware/auth');

router.use(staffAuth);

// 1. Dashboard Ringkasan (A2)
router.get('/dashboard', (req, res) => {
  const totalApps = db.prepare('SELECT COUNT(*) as count FROM applications').get().count;
  const waitingDecision = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'MENUNGGU_KEPUTUSAN'").get().count;
  const needReview = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'PERLU_DITINJAU'").get().count;
  const confirmedInterviews = db.prepare("SELECT COUNT(*) as count FROM interviews WHERE status = 'TERKONFIRMASI'").get().count;

  const groupDistribution = db.prepare(`
    SELECT group_label, COUNT(*) as count
    FROM applications
    WHERE group_label IS NOT NULL
    GROUP BY group_label
  `).all();

  const stageBreakdown = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM applications
    GROUP BY status
  `).all();

  const heartbeats = db.prepare('SELECT process_name, package_version, last_seen, task_count, status FROM heartbeats').all();

  res.json({
    metrics: {
      total_applications: totalApps,
      waiting_decision: waitingDecision,
      need_manual_review: needReview,
      confirmed_interviews: confirmedInterviews
    },
    group_distribution: groupDistribution,
    stage_breakdown: stageBreakdown,
    robot_heartbeats: heartbeats
  });
});

// 2. Lowongan Kerja (A3, A4)
router.get('/jobs', (req, res) => {
  const jobs = db.prepare(`
    SELECT j.*,
           (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as total_applicants,
           (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.status = 'MENUNGGU_KEPUTUSAN') as waiting_decision
    FROM jobs j
    ORDER BY j.created_at DESC
  `).all();
  res.json(jobs);
});

router.post('/jobs', (req, res) => {
  const { title, department, description, location, quota, window_hours, overbooking_percent, criteria } = req.body;
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  db.exec('BEGIN TRANSACTION;');
  try {
    db.prepare(`
      INSERT INTO jobs (id, title, department, description, location, quota, window_hours, overbooking_percent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
    `).run(jobId, title, department, description, location, quota || 5, window_hours || 24, overbooking_percent || 20);

    if (Array.isArray(criteria)) {
      const critStmt = db.prepare(`
        INSERT INTO criteria (id, job_id, criteria_type, value, synonyms_json, weight)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const c of criteria) {
        critStmt.run(`crit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, jobId, c.type, c.value, JSON.stringify(c.synonyms || []), c.weight || 0);
      }
    }

    db.exec('COMMIT;');
    res.status(201).json({ success: true, job_id: jobId });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
});

// 3. Direktori Pelamar (A5)
router.get('/applications', (req, res) => {
  const { job_id, group_label, status, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  let query = 'SELECT a.*, j.title as job_title FROM applications a JOIN jobs j ON a.job_id = j.id WHERE 1=1';
  const params = [];

  if (job_id) { query += ' AND a.job_id = ?'; params.push(job_id); }
  if (group_label) { query += ' AND a.group_label = ?'; params.push(group_label); }
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (search) {
    query += ' AND (a.name LIKE ? OR a.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY a.score DESC, a.created_at ASC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), offset);

  const rows = db.prepare(query).all(...params);
  res.json({ page: parseInt(page, 10), limit: parseInt(limit, 10), data: rows });
});

// 4. Detail Pelamar (A6)
router.get('/applications/:id', (req, res) => {
  const app = db.prepare(`
    SELECT a.*, j.title as job_title, j.interview_location
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!app) return res.status(404).json({ code: 'NOT_FOUND', message: 'Kandidat tidak ditemukan' });

  const extraction = db.prepare('SELECT * FROM extractions WHERE application_id = ?').get(req.params.id);
  const decisionHistory = db.prepare('SELECT d.*, u.name as hr_name FROM decisions d LEFT JOIN users u ON d.user_id = u.id WHERE d.application_id = ? ORDER BY d.created_at DESC').all(req.params.id);
  const messages = db.prepare('SELECT * FROM messages WHERE application_id = ? ORDER BY created_at DESC').all(req.params.id);

  res.json({
    application: {
      ...app,
      screening_answers: app.screening_answers_json ? JSON.parse(app.screening_answers_json) : {},
      score_breakdown: app.score_breakdown_json ? JSON.parse(app.score_breakdown_json) : []
    },
    extraction: extraction ? { ...extraction, parsed_data: JSON.parse(extraction.parsed_data_json || '{}') } : null,
    decisions: decisionHistory,
    messages
  });
});

// 5. Keputusan Tunggal HR (A6 / A7 - Penegakan BR-01)
router.post('/applications/:id/decision', (req, res) => {
  const { decision, notes } = req.body; // 'UNDANG' atau 'TOLAK'
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ code: 'NOT_FOUND', message: 'Kandidat tidak ditemukan' });

  let newStatus = '';
  if (decision === 'UNDANG') newStatus = 'DISETUJUI_UNDANG';
  else if (decision === 'TOLAK') newStatus = 'DISETUJUI_TOLAK';
  else return res.status(400).json({ code: 'INVALID_DECISION', message: 'Keputusan harus UNDANG atau TOLAK' });

  db.exec('BEGIN TRANSACTION;');
  try {
    // Rekam jejak keputusan HR
    db.prepare(`
      INSERT INTO decisions (id, application_id, user_id, previous_status, new_status, decision, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, app.id, req.user?.id || 'hr_admin', app.status, newStatus, decision, notes || '');

    // Perbarui status lamaran
    db.prepare('UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, app.id);

    // Jika ditolak: Buat entri antrean pesan penolakan resmi
    if (decision === 'TOLAK') {
      const job = db.prepare('SELECT title, talent_pool_enabled FROM jobs WHERE id = ?').get(app.job_id);
      const idempotencyKey = `REJECTION_${app.id}_v1`;
      const payload = {
        to_email: app.email,
        to_name: app.name,
        position: job.title,
        company: 'PT RecruitFlow Inovasi',
        talent_pool_link: job.talent_pool_enabled ? `http://localhost:3000/talent-pool/join?token=${app.token_status}` : null
      };

      db.prepare(`
        INSERT INTO messages (id, application_id, message_type, channel, status, payload_json, idempotency_key)
        VALUES (?, ?, 'PENOLAKAN', 'EMAIL', 'PENDING', ?, ?)
        ON CONFLICT(idempotency_key) DO NOTHING
      `).run(`msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, app.id, JSON.stringify(payload), idempotencyKey);
    }

    db.exec('COMMIT;');
    res.json({ success: true, new_status: newStatus });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
});

// 6. Persetujuan Massal HR (A7 - Guardrail: Tab PERLU_DICEK tidak diizinkan aksi massal)
router.post('/applications/bulk-decision', (req, res) => {
  const { target_group, decision } = req.body;

  if (target_group === 'PERLU_DICEK') {
    return res.status(422).json({
      code: 'GUARDRAIL_VIOLATION',
      message: 'Kandidat dalam kelompok PERLU_DICEK wajib ditinjau secara manual perorangan dan tidak boleh disetujui massal.'
    });
  }

  let expectedStatus = '';
  if (target_group === 'SESUAI' && decision === 'UNDANG') expectedStatus = 'DISETUJUI_UNDANG';
  else if (target_group === 'TIDAK_SESUAI' && decision === 'TOLAK') expectedStatus = 'DISETUJUI_TOLAK';
  else {
    return res.status(400).json({ code: 'INVALID_COMBINATION', message: 'Kombinasi kelompok dan keputusan tidak valid' });
  }

  const candidates = db.prepare(`
    SELECT id, status FROM applications
    WHERE group_label = ? AND status = 'MENUNGGU_KEPUTUSAN'
  `).all(target_group);

  db.exec('BEGIN TRANSACTION;');
  try {
    const updateStmt = db.prepare('UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const decStmt = db.prepare(`
      INSERT INTO decisions (id, application_id, user_id, previous_status, new_status, decision, notes)
      VALUES (?, ?, ?, 'MENUNGGU_KEPUTUSAN', ?, ?, 'Persetujuan Massal HR')
    `);

    for (const c of candidates) {
      updateStmt.run(expectedStatus, c.id);
      decStmt.run(`dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, c.id, req.user?.id || 'hr_admin', expectedStatus, decision);
    }

    db.exec('COMMIT;');
    res.json({ success: true, affected_count: candidates.length, new_status: expectedStatus });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
});

// 7. Monitoring Robot & Live Telemetri (A11)
router.get('/monitor/status', (req, res) => {
  const heartbeats = db.prepare('SELECT * FROM heartbeats').all();
  const logs = db.prepare('SELECT * FROM robot_logs ORDER BY created_at DESC LIMIT 50').all();
  res.json({ heartbeats, logs });
});

module.exports = router;
