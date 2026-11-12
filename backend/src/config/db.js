const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../../database');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'recruitflow.sqlite');
const db = new DatabaseSync(DB_PATH);

// Initialize Tables & Constraints
function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    -- Users (HR, Interviewer, Admin, User Department)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'HR', 'INTERVIEWER', 'USER_DEPARTMENT')),
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Jobs / Lowongan Kerja
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      quota INTEGER DEFAULT 5,
      status TEXT DEFAULT 'OPEN' CHECK(status IN ('DRAFT_USER', 'OPEN', 'CLOSED')),
      window_hours INTEGER DEFAULT 24,
      overbooking_percent INTEGER DEFAULT 20,
      interview_location TEXT DEFAULT 'Online via Google Meet',
      documents_required TEXT DEFAULT 'KTP, Portofolio, Transkrip Nilai',
      contact_person TEXT DEFAULT 'Tim Rekrutmen (081110108251)',
      talent_pool_enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Pertanyaan Screening Terstruktur
    CREATE TABLE IF NOT EXISTS screening_questions (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('TEXT', 'NUMBER', 'BOOLEAN', 'CHOICE')),
      options_json TEXT,
      is_required INTEGER DEFAULT 1,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- Kriteria & Bobot Skoring
    CREATE TABLE IF NOT EXISTS criteria (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      criteria_type TEXT NOT NULL CHECK(criteria_type IN ('KNOCKOUT_PENDIDIKAN', 'KNOCKOUT_PENGALAMAN', 'KNOCKOUT_DOMISILI', 'SKILL_WAJIB', 'SKILL_TAMBAHAN', 'PENGALAMAN_IDEAL')),
      value TEXT NOT NULL,
      synonyms_json TEXT,
      weight REAL DEFAULT 0,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- Lamaran Kandidat
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      education TEXT NOT NULL,
      experience_years REAL NOT NULL,
      screening_answers_json TEXT,
      cv_file_path TEXT NOT NULL,
      status TEXT DEFAULT 'BARU' CHECK(status IN (
        'BARU', 'DIPROSES', 'MENUNGGU_KEPUTUSAN', 'DISETUJUI_UNDANG', 'DISETUJUI_TOLAK',
        'MENUNGGU_KONFIRMASI', 'TERKONFIRMASI', 'TIDAK_HADIR', 'RESCHEDULE_DIMINTA',
        'TIDAK_MERESPONS', 'INTERVIEW_SELESAI', 'DITOLAK_TERKIRIM', 'TALENT_POOL', 'PERLU_DITINJAU'
      )),
      group_label TEXT CHECK(group_label IN ('SESUAI', 'PERLU_DICEK', 'TIDAK_SESUAI')),
      score REAL DEFAULT 0,
      score_breakdown_json TEXT,
      summary TEXT,
      confidence REAL DEFAULT 1.0,
      token_status TEXT UNIQUE NOT NULL,
      is_knockout_failed INTEGER DEFAULT 0,
      knockout_reason TEXT,
      claimed_by_robot INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- Hasil Ekstraksi CV oleh Robot
    CREATE TABLE IF NOT EXISTS extractions (
      id TEXT PRIMARY KEY,
      application_id TEXT UNIQUE NOT NULL,
      text_content TEXT,
      parsed_data_json TEXT,
      confidence REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );

    -- Jejak Keputusan HR (Audit Trail)
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      decision TEXT NOT NULL CHECK(decision IN ('UNDANG', 'TOLAK', 'TALENT_POOL')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Template Pesan
    CREATE TABLE IF NOT EXISTS message_templates (
      id TEXT PRIMARY KEY,
      message_type TEXT UNIQUE NOT NULL CHECK(message_type IN ('UNDANGAN', 'PENOLAKAN', 'PENGINGAT_KONFIRMASI', 'PENGINGAT_H1', 'RESCHEDULE')),
      channel TEXT DEFAULT 'EMAIL',
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1
    );

    -- Antrean Pesan Komunikasi (Disahkan HR)
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      message_type TEXT NOT NULL,
      channel TEXT DEFAULT 'EMAIL',
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'SENDING', 'SENT', 'FAILED')),
      payload_json TEXT NOT NULL,
      error_message TEXT,
      idempotency_key TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );

    -- Interviewer
    CREATE TABLE IF NOT EXISTS interviewers (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      slot_duration_minutes INTEGER DEFAULT 30,
      capacity INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Slot Waktu Kalender
    CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      interviewer_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      status TEXT DEFAULT 'TERSEDIA' CHECK(status IN ('TERSEDIA', 'DITAHAN', 'TERISI', 'DIBLOKIR')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(interviewer_id, start_time),
      FOREIGN KEY (interviewer_id) REFERENCES interviewers(id) ON DELETE CASCADE
    );

    -- Alokasi Wawancara Kandidat
    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      application_id TEXT UNIQUE NOT NULL,
      slot_id TEXT NOT NULL,
      status TEXT DEFAULT 'MENUNGGU_KONFIRMASI' CHECK(status IN ('MENUNGGU_KONFIRMASI', 'TERKONFIRMASI', 'TIDAK_HADIR', 'RESCHEDULE_DIMINTA', 'TIDAK_MERESPONS', 'SELESAI')),
      hold_until DATETIME NOT NULL,
      version INTEGER DEFAULT 1,
      token_confirm TEXT UNIQUE NOT NULL,
      confirmed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE
    );

    -- Log Telemetri Robot
    CREATE TABLE IF NOT EXISTS robot_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process_name TEXT NOT NULL,
      job_id TEXT,
      application_id TEXT,
      message_id TEXT,
      log_level TEXT DEFAULT 'INFO',
      event_name TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Detak Jantung Robot (Heartbeat)
    CREATE TABLE IF NOT EXISTS heartbeats (
      process_name TEXT PRIMARY KEY,
      package_version TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      task_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ACTIVE'
    );
  `);
}

initDatabase();

module.exports = { db, initDatabase };
