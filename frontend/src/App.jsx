import React, { useState } from 'react';
import CockpitShell from './components/CockpitShell';
import A1Login from './pages/A1Login';
import A2Dashboard from './pages/A2Dashboard';
import { A3Jobs, A4Criteria } from './pages/A3A4Jobs';
import { A5Candidates, A6CandidateDetail } from './pages/A5A6Candidates';
import A7Gate from './pages/A7Gate';
import { A8Messages, A9Slots, A10Calendar } from './pages/A8A9A10Ops';
import { A11Robot, A12Reports, A13TalentPool, A14Settings, I1MySchedule } from './pages/A11A12A13A14Admin';
import { INITIAL_JOBS, INITIAL_CANDIDATES, ROLE_PERMISSIONS } from './services/mockData';

const BREADCRUMBS = {
  dashboard: ['Cockpit HR', 'Executive Dashboard'],
  jobs: ['Cockpit HR', 'Manajemen Lowongan'],
  criteria: ['Cockpit HR', 'Manajemen Lowongan', 'Kriteria & Bobot Robot'],
  candidates: ['Cockpit HR', 'Direktori Kandidat'],
  candidateDetail: ['Cockpit HR', 'Direktori Kandidat', 'Detail & Riwayat CV'],
  gate: ['Cockpit HR', 'Gerbang Persetujuan (Approval Gate)'],
  interviews: ['Cockpit HR', 'Jadwal & Kalender Wawancara'],
  slots: ['Cockpit HR', 'Jadwal Wawancara', 'Pewawancara & Generator Slot'],
  messages: ['Cockpit HR', 'Pesan & Template Komunikasi'],
  robot: ['Cockpit HR', 'Pemantauan Robot UiPath'],
  reports: ['Cockpit HR', 'Analisis & Laporan'],
  talentPool: ['Cockpit HR', 'Bank Talenta (Talent Pool)'],
  settings: ['Cockpit HR', 'Pengaturan Sistem & Token Robot'],
  mySchedule: ['Interviewer', 'Jadwal Saya'],
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState('ADMIN');
  const [page, setPage] = useState('dashboard');
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState(INITIAL_JOBS[0]);
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [selectedCandidateId, setSelectedCandidateId] = useState('cand_1');
  const [globalSearch, setGlobalSearch] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLogin = (chosenRole) => {
    setRole(chosenRole);
    setLoggedIn(true);
    if (chosenRole === 'HIRING_USER') setPage('gate');
    else if (chosenRole === 'INTERVIEWER') setPage('mySchedule');
    else setPage('dashboard');
  };

  if (!loggedIn) {
    return <A1Login onLogin={handleLogin} />;
  }

  const allowedPages = ROLE_PERMISSIONS[role] || [];
  const waitingCount = candidates.filter(
    (c) => c.status === 'MENUNGGU_KEPUTUSAN' || c.status === 'PERLU_DITINJAU'
  ).length;

  const decideCandidate = (id, status) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const bulkApprove = (ids) => {
    setCandidates((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, status: 'DISETUJUI_UNDANG' } : c))
    );
  };

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  return (
    <CockpitShell
      activePage={page}
      onNavigate={setPage}
      role={role}
      onChangeRole={(newRole) => {
        setRole(newRole);
        const perms = ROLE_PERMISSIONS[newRole];
        if (!perms.includes(page)) setPage(perms[0]);
      }}
      onLogout={() => setLoggedIn(false)}
      allowedPages={allowedPages}
      waitingCount={waitingCount}
      breadcrumbs={BREADCRUMBS[page] || ['Cockpit HR']}
      globalSearch={globalSearch}
      onGlobalSearch={(val) => {
        setGlobalSearch(val);
        if (val && page !== 'candidates') setPage('candidates');
      }}
      offlineMode={offlineMode}
      onToggleOffline={() => setOfflineMode(!offlineMode)}
    >
      {page === 'dashboard' && <A2Dashboard waitingCount={waitingCount} onNavigate={setPage} />}

      {page === 'jobs' && (
        <A3Jobs
          jobs={jobs}
          onSelectJobCriteria={(j) => {
            setSelectedJob(j);
            setPage('criteria');
          }}
          onDuplicateJob={(j) =>
            setJobs((prev) => [
              {
                ...j,
                id: `job_copy_${Date.now()}`,
                title: `${j.title} (Salinan)`,
                status: 'DRAFT',
                applicants: 0,
                waitingReview: 0,
              },
              ...prev,
            ])
          }
          onCloseJob={(id) =>
            setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: 'CLOSED' } : j)))
          }
        />
      )}

      {page === 'criteria' && <A4Criteria job={selectedJob} onBack={() => setPage('jobs')} />}

      {page === 'candidates' && (
        <A5Candidates
          candidates={candidates}
          onSelectCandidate={(c) => {
            setSelectedCandidateId(c.id);
            setPage('candidateDetail');
          }}
          onBulkApprove={bulkApprove}
          onNavigateGate={() => setPage('gate')}
        />
      )}

      {page === 'candidateDetail' && (
        <A6CandidateDetail
          candidate={selectedCandidate}
          onBack={() => setPage('candidates')}
          onDecide={(id, st) => {
            decideCandidate(id, st);
            setPage('gate');
          }}
        />
      )}

      {page === 'gate' && (
        <A7Gate
          candidates={candidates}
          role={role}
          onDecide={decideCandidate}
          onBulkApprove={bulkApprove}
          onPreviewCandidate={(c) => {
            setSelectedCandidateId(c.id);
            setPage('candidateDetail');
          }}
        />
      )}

      {page === 'interviews' && <A10Calendar onOpenSlots={() => setPage('slots')} />}
      {page === 'slots' && <A9Slots onBackToCalendar={() => setPage('interviews')} />}
      {page === 'messages' && <A8Messages />}
      {page === 'robot' && <A11Robot />}
      {page === 'reports' && <A12Reports />}
      {page === 'talentPool' && <A13TalentPool />}
      {page === 'settings' && <A14Settings />}
      {page === 'mySchedule' && <I1MySchedule onLogout={() => setLoggedIn(false)} />}
    </CockpitShell>
  );
}
