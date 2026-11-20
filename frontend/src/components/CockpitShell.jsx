import React, { useState } from 'react';
import {
  Home, Briefcase, Users, ClipboardCheck, Calendar, MessageSquare,
  Bot, BarChart2, Bookmark, SlidersHorizontal, Search, Bell, LogOut, ShieldAlert, WifiOff,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'jobs', label: 'Lowongan', icon: Briefcase },
  { id: 'candidates', label: 'Kandidat', icon: Users, badgeKey: 'waiting' },
  { id: 'gate', label: 'Persetujuan', icon: ClipboardCheck },
  { id: 'interviews', label: 'Interview', icon: Calendar },
  { id: 'messages', label: 'Pesan', icon: MessageSquare },
  { id: 'robot', label: 'Robot', icon: Bot },
  { id: 'reports', label: 'Laporan', icon: BarChart2 },
  { id: 'talentPool', label: 'Talent Pool', icon: Bookmark },
];

export function LogoMark({ size = 36 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl bg-[#FFCC00] flex items-center justify-center shrink-0"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path
          d="M7 18V6H13.5C15.7 6 17.5 7.6 17.5 9.8C17.5 12 15.7 13.5 13.5 13.5H7M12.5 13.5L17.5 18"
          stroke="#172033"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function StatusChip({ children, variant = 'neutral', dot = false }) {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700',
    yellow: 'bg-[#FFF7CC] text-[#172033]',
    success: 'bg-[#DCFCE7] text-[#15803D]',
    warning: 'bg-[#FEF3C7] text-[#A16207]',
    error: 'bg-[#FEE2E2] text-[#B91C1C]',
    info: 'bg-[#DBEAFE] text-[#1D4ED8]',
    ai: 'bg-[#F0EDFF] text-[#6656D9]',
    navy: 'bg-[#172033] text-white',
  };
  const dotColors = {
    neutral: 'bg-slate-500',
    yellow: 'bg-[#172033]',
    success: 'bg-[#15803D]',
    warning: 'bg-[#A16207]',
    error: 'bg-[#B91C1C]',
    info: 'bg-[#1D4ED8]',
    ai: 'bg-[#6656D9]',
    navy: 'bg-white',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
        styles[variant] || styles.neutral
      }`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export default function CockpitShell({
  activePage,
  onNavigate,
  role,
  onChangeRole,
  onLogout,
  allowedPages,
  waitingCount,
  breadcrumbs = [],
  globalSearch,
  onGlobalSearch,
  offlineMode,
  onToggleOffline,
  children,
}) {
  const [showNotif, setShowNotif] = useState(false);

  const visibleNav = NAV_ITEMS.filter((n) => allowedPages.includes(n.id));
  const hasAccess = allowedPages.includes(activePage);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-[#172033] text-slate-200 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-5 py-5 flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <p className="font-display font-semibold text-base text-white leading-tight">RecruitFlow</p>
            <p className="text-[11px] text-slate-400">Cockpit HR</p>
          </div>
        </div>

        <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const on = activePage === item.id || (item.id === 'jobs' && activePage === 'criteria') || (item.id === 'candidates' && activePage === 'candidateDetail') || (item.id === 'interviews' && activePage === 'slots');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-semibold transition ${
                  on
                    ? 'bg-[#FFCC00] text-[#172033]'
                    : 'text-slate-300 hover:bg-[#25324A] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badgeKey === 'waiting' && waitingCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
                      on ? 'bg-[#172033] text-[#FFCC00]' : 'bg-[#25324A] text-white'
                    }`}
                  >
                    {waitingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 space-y-1.5 border-t border-slate-800">
          {allowedPages.includes('settings') && (
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-semibold transition ${
                activePage === 'settings'
                  ? 'bg-[#FFCC00] text-[#172033]'
                  : 'text-slate-300 hover:bg-[#25324A] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
              <span>Pengaturan</span>
            </button>
          )}

          <div className="bg-[#25324A] rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FFCC00] text-[#172033] font-bold text-xs flex items-center justify-center shrink-0">
              {role === 'ADMIN' ? 'RH' : role === 'HR' ? 'RH' : role === 'HIRING_USER' ? 'BS' : 'DK'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {role === 'HIRING_USER' ? 'Bima Saputra' : role === 'INTERVIEWER' ? 'Dedi Kurniawan' : 'Rina Hartono'}
              </p>
              <p className="text-[10px] text-slate-300">{role}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Keluar"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-300">/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'font-semibold text-[#172033]' : 'text-slate-500'}>
                  {b}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="flex-1" />

          {/* Role & Offline Quick Switcher for testing edge cases */}
          <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg">
            <span className="text-[11px] font-medium text-slate-500">Peran:</span>
            <select
              value={role}
              onChange={(e) => onChangeRole(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#172033] focus:outline-none"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="HR">HR</option>
              <option value="HIRING_USER">HIRING_USER</option>
              <option value="INTERVIEWER">INTERVIEWER</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onToggleOffline}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
              offlineMode
                ? 'bg-[#FEE2E2] border-red-200 text-[#B91C1C]'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" strokeWidth={1.5} />
            {offlineMode ? 'Offline (503)' : 'Sim. Offline'}
          </button>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => onGlobalSearch(e.target.value)}
              placeholder="Cari kandidat atau kode APP..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#172033] focus:bg-white"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotif(!showNotif)}
              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center relative hover:bg-slate-50"
            >
              <Bell className="w-4 h-4 text-[#172033]" strokeWidth={1.5} />
              <span className="w-2 h-2 rounded-full bg-[#B91C1C] absolute top-1.5 right-1.5" />
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-lg p-3 space-y-2 z-30">
                <p className="text-xs font-bold text-[#172033]">Notifikasi Terbaru</p>
                <div className="text-xs text-slate-600 p-2 rounded-lg bg-slate-50">
                  14 kandidat Crew Operasional menunggu di tab Perlu Dicek.
                </div>
                <div className="text-xs text-[#B91C1C] p-2 rounded-lg bg-[#FEE2E2]">
                  1 berkas CV (APP-2026-R4T9) gagal OCR dan masuk PERLU_DITINJAU.
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Global Offline Banner */}
        {offlineMode && (
          <div className="bg-[#172033] text-white px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-[#FFCC00]" strokeWidth={1.5} />
              <span>Koneksi ke server terputus (503). Data terakhir tetap ditampilkan secara lokal.</span>
            </div>
            <button
              type="button"
              onClick={onToggleOffline}
              className="px-3 py-1 rounded bg-[#FFCC00] text-[#172033] font-semibold"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Content or 403 Forbidden */}
        <main className="flex-1 p-6 max-w-[1320px] w-full mx-auto">
          {!hasAccess ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h2 className="font-display font-bold text-xl text-[#172033]">
                403 · Anda tidak memiliki akses ke halaman ini
              </h2>
              <p className="text-sm text-slate-500">
                Peran <span className="font-semibold text-[#172033]">{role}</span> tidak diizinkan membuka menu ini sesuai matriks akses PRD.
              </p>
              <button
                type="button"
                onClick={() => onNavigate(allowedPages[0])}
                className="px-5 py-2.5 rounded-xl bg-[#172033] text-white text-sm font-semibold"
              >
                Kembali ke Halaman Utama Saya
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
