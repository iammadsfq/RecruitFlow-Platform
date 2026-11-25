import { INITIAL_JOBS, INITIAL_CANDIDATES } from './mockData';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

let authToken = typeof window !== 'undefined' ? window.localStorage.getItem('rf_staff_token') || '' : '';

function getHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  } else {
    headers['X-Dev-User'] = 'usr_admin_01';
  }
  return headers;
}

export function setAuthToken(token) {
  authToken = token || '';
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem('rf_staff_token', token);
    else window.localStorage.removeItem('rf_staff_token');
  }
}

function getInitials(name = 'K') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'RF';
}

function mapBackendApplication(row) {
  let breakdown = [];
  try {
    const parsed = row.score_breakdown_json ? JSON.parse(row.score_breakdown_json) : [];
    if (Array.isArray(parsed)) {
      breakdown = parsed;
    } else if (parsed && typeof parsed === 'object') {
      breakdown = Object.entries(parsed).map(([k, v]) => ({
        label: k.replace(/_/g, ' '),
        pts: typeof v === 'number' ? `${Math.round(v)} pts` : String(v),
        pct: typeof v === 'number' ? Math.min(100, Math.round(v)) : 80,
        color: '#1D4ED8',
      }));
    }
  } catch {
    breakdown = [];
  }

  return {
    id: row.id,
    code: row.id.toUpperCase(),
    initials: getInitials(row.name),
    name: row.name,
    email: row.email,
    phone: row.phone,
    jobId: row.job_id,
    jobTitle: row.job_title || 'Junior Software Engineer',
    city: row.city,
    score: Math.round(row.score || 0),
    group: row.group_label || 'PERLU_DICEK',
    status: row.status || 'BARU',
    reason: row.summary || row.knockout_reason || `${row.education} · ${row.experience_years} thn pengalaman · ${row.city}`,
    appliedAt: row.created_at || '-',
    confidence: Math.round((row.confidence || 0.9) * 100),
    cvNote: `Confidence OCR: ${Math.round((row.confidence || 0.9) * 100)}%`,
    cvUrl: `${API_BASE}/hr/applications/${encodeURIComponent(row.id)}/cv`,
    mismatch: row.group_label === 'PERLU_DICEK',
    formVsCv: [
      { field: 'Pendidikan Terakhir', form: row.education || '-', cv: row.education || '-', status: 'match' },
      { field: 'Pengalaman Kerja', form: `${row.experience_years ?? 0} Tahun`, cv: `${row.experience_years ?? 0} Tahun`, status: 'match' },
      { field: 'Domisili', form: row.city || '-', cv: row.city || '-', status: 'match' },
    ],
    aiSummary: row.summary ? [row.summary] : ['Menunggu atau selesai diproses oleh robot CV Screening.'],
    breakdown: breakdown.length
      ? breakdown
      : [
          { label: 'Skor Keseluruhan Robot', pts: `${Math.round(row.score || 0)} / 100`, pct: Math.round(row.score || 0), color: '#1D4ED8' },
        ],
    isLive: true,
  };
}

function mapBackendJob(j) {
  return {
    id: j.id,
    title: j.title,
    location: j.location,
    type: j.type || 'Full-time',
    department: j.department,
    approvalMode: j.approval_mode || 'HR_AND_USER',
    hiringScale: j.hiring_scale || (j.quota >= 10 ? 'MASS' : 'MANAGEMENT'),
    quota: j.quota ?? 5,
    applicants: j.total_applicants ?? 0,
    waitingReview: j.waiting_decision ?? 0,
    status: j.status || 'OPEN',
    deadline: j.close_date || '30 Des 2026',
    closingSoon: false,
    weights: INITIAL_JOBS[0].weights,
    isLive: true,
  };
}

export async function loginStaff(email, password, role = 'ADMIN') {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data.message || 'Email atau kata sandi tidak sesuai.' };
    }
    setAuthToken(data.token);
    return { ok: true, user: data.user, isLive: true };
  } catch {
    // Graceful fallback when backend is offline
    if (email.trim().toLowerCase() === 'salah@email.com') {
      return { ok: false, message: 'Email atau kata sandi tidak sesuai.' };
    }
    return { ok: true, user: { id: 'usr_offline', name: 'Rina Hartono', email, role }, isLive: false };
  }
}

export async function fetchCockpitBootstrap() {
  try {
    const [jobsRes, appsRes, dashRes, monRes] = await Promise.all([
      fetch(`${API_BASE}/hr/jobs`, { headers: getHeaders(), signal: AbortSignal.timeout(3000) }),
      fetch(`${API_BASE}/hr/applications?limit=100`, { headers: getHeaders(), signal: AbortSignal.timeout(3000) }),
      fetch(`${API_BASE}/hr/dashboard`, { headers: getHeaders(), signal: AbortSignal.timeout(3000) }),
      fetch(`${API_BASE}/hr/monitor/status`, { headers: getHeaders(), signal: AbortSignal.timeout(3000) }),
    ]);
    if (!jobsRes.ok || !appsRes.ok) throw new Error('Backend unavailable');
    const jobsRaw = await jobsRes.json();
    const appsPayload = await appsRes.json();
    const dashboard = dashRes.ok ? await dashRes.json() : null;
    const monitor = monRes.ok ? await monRes.json() : null;

    const jobs = Array.isArray(jobsRaw) && jobsRaw.length > 0 ? jobsRaw.map(mapBackendJob) : INITIAL_JOBS;
    const rows = Array.isArray(appsPayload?.data) ? appsPayload.data : [];
    const candidates = rows.length > 0 ? rows.map(mapBackendApplication) : INITIAL_CANDIDATES;

    return { jobs, candidates, dashboard, monitor, isLive: true };
  } catch {
    return { jobs: INITIAL_JOBS, candidates: INITIAL_CANDIDATES, dashboard: null, monitor: null, isLive: false };
  }
}

export async function decideCandidateApi(id, status, notes = '') {
  const decisionMap = {
    DISETUJUI_UNDANG: 'UNDANG',
    DISETUJUI_TOLAK: 'TOLAK',
    TALENT_POOL: 'TALENT_POOL',
    MENUNGGU_USER: 'MENUNGGU_USER',
  };
  const decision = decisionMap[status];
  if (!decision) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/hr/applications/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ decision, notes }),
      signal: AbortSignal.timeout(3000),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export async function bulkDecideApi(targetGroup, decision) {
  try {
    const res = await fetch(`${API_BASE}/hr/applications/bulk-decision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ target_group: targetGroup, decision }),
      signal: AbortSignal.timeout(3000),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export async function updateJobStatusApi(id, status) {
  try {
    const res = await fetch(`${API_BASE}/hr/jobs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
      signal: AbortSignal.timeout(3000),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
