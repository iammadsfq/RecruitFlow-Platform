import React, { useState } from 'react';
import { Bot, RefreshCw, AlertTriangle, Check, Lock, Copy, Bookmark, FileText, Clock } from 'lucide-react';
import { Terminal } from '@lucasmarkes/hairline/react';
import { StatusChip } from '../components/CockpitShell';
import { DonutChart } from '../components/Charts';
import { SakugaButton, SakugaCard } from '../components/SakugaVFX';
import { INITIAL_TALENT_POOL } from '../services/mockData';

export function A11Robot() {
  const [running, setRunning] = useState(false);
  const [exceptions, setExceptions] = useState([
    { id: 'ex1', title: 'RF_CV_Screening · APP-2026-R4T9', desc: 'OCR_LOW_CONFIDENCE (31%): PDF scan kabur · Dialihkan ke PERLU_DITINJAU', action: 'Tinjau' },
    { id: 'ex2', title: 'RF_Messaging · MSG-8841 (SMTP Timeout)', desc: 'Gagal kirim email pengingat ke APP-L7V4 (Percobaan 2/3)', action: 'Retry' },
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">Pemantauan Robot UiPath</h1>
          <p className="text-sm text-slate-500">Status 4 proses RPA, pusat pengecualian (Retry), dan live log tanpa PII</p>
        </div>
        <SakugaButton
          disabled={running}
          impactText="RUN RPA!"
          onClick={() => {
            setRunning(true);
            setTimeout(() => setRunning(false), 1500);
          }}
          className="px-4 h-10 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] disabled:bg-slate-200 text-[#172033] text-xs font-semibold inline-flex items-center gap-2"
        >
          <Bot className="w-4 h-4" strokeWidth={1.5} />
          {running ? 'Permintaan masuk antrean...' : 'Jalankan RF_CV_Screening Sekarang'}
        </SakugaButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['RF_CV_Screening', 'Ekstraksi PDF & Skoring', running ? 'Berjalan' : 'Aktif', 'success', '1.248 CV · Rata-rata 4,2 dtk/CV'],
          ['RF_Messaging', 'Email & WhatsApp', 'Antre: 3', 'success', '612 pesan · 99,5% sukses · Patuh BR-01'],
          ['RF_Scheduling', 'Alokasi & Pelepasan Slot', 'Standby', 'neutral', '42 slot dikunci · 5 dilepas otomatis'],
          ['RF_Reporting', 'Agregasi Metrik Harian', '18.00 WIB', 'info', 'Laporan terakhir: Kemarin 18.00 WIB'],
        ].map(([name, desc, st, k, stat], idx) => (
          <SakugaCard key={name} delay={idx * 0.05} className="bg-white rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172033]">
                <Bot className="w-4 h-4" strokeWidth={1.5} />
                {name}
              </span>
              <StatusChip variant={k} dot>{st}</StatusChip>
            </div>
            <p className="text-xs text-slate-600">{desc}</p>
            <p className="text-[11px] text-slate-400">{stat}</p>
          </SakugaCard>
        ))}
      </div>

      {/* Exceptions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-base">Pusat Pengecualian Robot (Exception Queue)</h3>
          {exceptions.length > 0 && (
            <button
              type="button"
              onClick={() => setExceptions([])}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
              Ulangi Semua ({exceptions.length})
            </button>
          )}
        </div>
        {exceptions.length === 0 ? (
          <div className="bg-[#DCFCE7] rounded-xl p-4 text-xs font-semibold text-[#15803D] flex items-center gap-2">
            <Check className="w-4 h-4" strokeWidth={2} />
            Tidak ada pengecualian yang perlu ditangani.
          </div>
        ) : (
          exceptions.map((ex) => (
            <div key={ex.id} className="bg-[#FEE2E2] rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-xs">
                  <p className="font-bold text-[#B91C1C]">{ex.title}</p>
                  <p className="text-red-900">{ex.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExceptions((prev) => prev.filter((x) => x.id !== ex.id))}
                className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold text-[#B91C1C]"
              >
                {ex.action}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Live Terminal (No PII) + @lucasmarkes/hairline Terminal Figure */}
      <div className="bg-[#172033] rounded-xl p-5 grid grid-cols-1 lg:grid-cols-4 gap-5 items-center">
        <div className="lg:col-span-3 space-y-2 font-mono text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <span className="font-sans font-semibold text-[#FFCC00]">
              Live Robot Log · Mode Aman (PII Disamarkan sesuai kebijakan privasi)
            </span>
            <StatusChip variant="navy">Auto-scroll Aktif</StatusChip>
          </div>
          <p>[13:45:02 INFO] RF_CV_Screening · Memulai ekstraksi dokumen untuk ref=APP-2026-X9A7 (PII masked)</p>
          <p>[13:45:05 INFO] RF_CV_Screening · Skor dihitung: total=86, kelompok=SESUAI, confidence=0.94</p>
          <p className="text-amber-300">[13:45:12 WARN] RF_CV_Screening · ref=APP-2026-R4T9 teks kosong/scan kabur -&gt; PERLU_DITINJAU</p>
          <p>[13:46:01 INFO] RF_Messaging · Memeriksa antrean pesan approval=APPROVED (BR-01 tervalidasi)</p>
        </div>
        <div className="hairline-theme-navy rounded-xl bg-[#172033] p-1">
          <Terminal play intensity={0.75} theme="dark" label="Terminal Live Log Robot" className="w-full" />
        </div>
      </div>
    </div>
  );
}

export function A12Reports() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#172033]">Analisis & Laporan Efisiensi Rekrutmen</h1>
        <p className="text-sm text-slate-500">Perbandingan waktu kerja manual vs otomatisasi RecruitFlow UiPath RPA</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Hemat Waktu', '86,4%', 'PRD ≥ 80%', 'success', '142 jam kerja HR dihemat bulan ini'],
          ['Waktu Skrining', '4,2 dtk', '-98% manual', 'info', 'Manual rata-rata 3,5 menit per CV'],
          ['Undangan → Hadir', '88,2%', '+12,4%', 'success', '217 hadir dari 246 undangan'],
          ['Akurasi OCR', '94,9%', '64 tinjau', 'ai', 'Dari 1.248 berkas PDF pelamar'],
        ].map(([t, v, b, k, sub]) => (
          <div key={t} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">{t}</span>
              <StatusChip variant={k}>{b}</StatusChip>
            </div>
            <p className="font-display font-bold text-3xl text-[#172033] tabular-nums">{v}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-display font-semibold text-base">Efisiensi & Konversi per Lowongan Aktif</h3>
          {[
            ['Crew Operasional (Jakarta)', '240 pelamar · 38% sesuai · 90% hadir wawancara', 90, '#FFCC00'],
            ['Customer Service (Bandung)', '148 pelamar · 31% sesuai · 85% hadir wawancara', 85, '#1D4ED8'],
            ['Warehouse Staff (Surabaya)', '96 pelamar · 29% sesuai · 82% hadir wawancara', 82, '#172033'],
          ].map(([jb, desc, pct, col]) => (
            <div key={jb} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>{jb}</span>
                <span>{pct}% hadir</span>
              </div>
              <p className="text-[11px] text-slate-500">{desc}</p>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: col }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-display font-semibold text-base">Rasio Kehadiran Wawancara</h3>
          <div className="flex items-center gap-4">
            <DonutChart
              size={140}
              centerBig="88%"
              centerSmall="Hadir"
              segments={[
                { value: 217, color: '#15803D' },
                { value: 14, color: '#1D4ED8' },
                { value: 15, color: '#B91C1C' },
              ]}
            />
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-[#15803D]">● Hadir jadwal: 217</p>
              <p className="font-semibold text-[#1D4ED8]">● Reschedule: 14</p>
              <p className="font-semibold text-[#B91C1C]">● Tidak hadir: 15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function A13TalentPool() {
  const [pool, setPool] = useState(INITIAL_TALENT_POOL);
  const [tagFilter, setTagFilter] = useState('Semua');

  const filtered = pool.filter(
    (p) => tagFilter === 'Semua' || p.tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">Bank Talenta (Talent Pool)</h1>
          <p className="text-sm text-slate-500">Hanya menampilkan kandidat yang menyetujui penyimpanan data · Retensi 180 hari</p>
        </div>
        <StatusChip variant="info">Kebijakan Retensi: 180 Hari</StatusChip>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Semua', 'Kasir POS', 'Stock Opname', 'CRM', 'Inventory'].map((tg) => (
          <button
            key={tg}
            type="button"
            onClick={() => setTagFilter(tg)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
              tagFilter === tg ? 'bg-[#172033] text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {tg}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((tp) => (
          <div key={tp.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FFF7CC] text-[#172033] font-bold text-sm flex items-center justify-center shrink-0">
                {tp.initials}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-semibold text-base">{tp.name}</h3>
                  <StatusChip variant={tp.expiringSoon ? 'warning' : 'success'} dot>
                    {tp.retentionText}
                  </StatusChip>
                </div>
                <p className="text-xs text-slate-500">{tp.prevJob}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tp.tags.map((t) => (
                    <StatusChip key={t} variant="neutral">{t}</StatusChip>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPool((prev) => prev.filter((x) => x.id !== tp.id))}
                className="px-3 h-9 rounded-lg border border-red-200 text-[#B91C1C] text-xs font-semibold hover:bg-red-50"
              >
                Hapus Data (Tarik Izin)
              </button>
              <button
                type="button"
                onClick={() => alert(`Undangan melamar dikirim ke ${tp.name}`)}
                className="px-3.5 h-9 rounded-lg bg-[#FFCC00] text-[#172033] text-xs font-semibold"
              >
                Undang ke Lowongan Baru
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function A14Settings() {
  const [token, setToken] = useState('rf_live_••••••••••••••••••••••••9f4a');
  const [revealed, setRevealed] = useState(false);

  const rotateToken = () => {
    const rand = Math.random().toString(36).substring(2, 10);
    setToken(`rf_live_new_${rand}_88x1`);
    setRevealed(true);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#172033]">Pengaturan Sistem, Peran & Token Robot</h1>
        <p className="text-sm text-slate-500">Khusus ADMIN · Kelola akun staf, rotasi token Orchestrator, dan retensi data CV</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-display font-semibold text-base">Daftar Akun Staf & Peran Akses</h3>
          {[
            ['RH', 'Rina Hartono', 'rina.hartono@inovasidigital.co.id', 'ADMIN + HR', 'Terkunci (Admin Terakhir)'],
            ['BS', 'Bima Saputra', 'bima.s@inovasidigital.co.id', 'HIRING_USER', 'Crew Operasional'],
            ['DK', 'Dedi Kurniawan', 'dedi.k@inovasidigital.co.id', 'INTERVIEWER', 'Customer Service'],
          ].map(([ini, nm, em, role, note]) => (
            <div key={nm} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FFF7CC] text-[#172033] font-bold text-xs flex items-center justify-center">
                {ini}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{nm}</p>
                <p className="text-xs text-slate-500">{em} · {note}</p>
              </div>
              <StatusChip variant="yellow">{role}</StatusChip>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-display font-semibold text-base">Token Autentikasi Robot (Orchestrator)</h3>
            <p className="text-xs text-slate-500">
              Token hanya ditampilkan penuh satu kali saat dibuat atau dirotasi.
            </p>
            <div className="bg-[#172033] text-white p-3 rounded-xl flex items-center gap-3">
              <Lock className="w-4 h-4 text-[#FFCC00] shrink-0" strokeWidth={1.5} />
              <span className="font-mono text-xs flex-1 truncate">{token}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(token)}
                className="px-2.5 py-1 rounded bg-[#FFCC00] text-[#172033] text-xs font-semibold inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" strokeWidth={1.5} />
                Salin
              </button>
            </div>
            {revealed && (
              <p className="text-xs font-semibold text-[#15803D]">
                Token baru dibuat! Segera salin dan pasang di UiPath Orchestrator sebelum menutup halaman.
              </p>
            )}
            <div className="bg-[#FEF3C7] text-[#A16207] rounded-lg p-3 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>Merotasi token akan menghentikan koneksi robot sampai token baru dipasang di Orchestrator.</span>
            </div>
            <button
              type="button"
              onClick={rotateToken}
              className="px-4 h-9 rounded-lg border border-red-200 text-[#B91C1C] text-xs font-semibold hover:bg-red-50"
            >
              Rotasi Token Robot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function I1MySchedule({ onLogout }) {
  const [notes, setNotes] = useState('');
  const [savedNote, setSavedNote] = useState(false);

  return (
    <div className="max-w-md mx-auto space-y-4 py-2">
      <div className="bg-[#172033] text-white rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg">Jadwal Wawancara Saya</h2>
          <p className="text-xs text-slate-300">Dedi Kurniawan · Interviewer</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg bg-[#25324A] text-xs font-semibold"
        >
          Keluar
        </button>
      </div>

      <div className="bg-[#FFFBE6] border-2 border-[#FFCC00] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <StatusChip variant="yellow">● Berlangsung · 11.00 WIB</StatusChip>
          <StatusChip variant="success">Terkonfirmasi</StatusChip>
        </div>
        <div>
          <h3 className="font-display font-bold text-lg">Nadia Putri</h3>
          <p className="text-xs text-slate-600">Customer Service · Ruang Meeting B (Lt. 2)</p>
        </div>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan wawancara (opsional)..."
          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => alert('Membuka CV Nadia Putri (Read-Only)')}
            className="h-10 rounded-xl border border-slate-300 bg-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            Buka CV
          </button>
          <button
            type="button"
            onClick={() => setSavedNote(true)}
            className="h-10 rounded-xl bg-[#FFCC00] text-[#172033] text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            {savedNote ? 'Tersimpan!' : 'Simpan Catatan'}
          </button>
        </div>
      </div>

      {[
        ['13.30 – 14.00 WIB', 'Lina Marlina', 'Online (Google Meet)', 'Menunggu konfirmasi', 'warning'],
        ['Besok · 10.00 WIB', 'Yuni Kartika', 'Ruang Meeting B', 'Terkonfirmasi', 'success'],
        ['Rabu · 09.00 WIB', 'Hendra Gunawan', 'Dibatalkan kandidat', 'Dibatalkan', 'error'],
      ].map(([tm, nm, loc, st, k]) => (
        <div key={nm} className="bg-white rounded-xl border border-slate-200 p-4 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold inline-flex items-center gap-1 text-[#172033]">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              {tm}
            </span>
            <StatusChip variant={k}>{st}</StatusChip>
          </div>
          <p className="font-display font-semibold text-base">{nm}</p>
          <p className="text-xs text-slate-500">{loc}</p>
        </div>
      ))}
    </div>
  );
}
