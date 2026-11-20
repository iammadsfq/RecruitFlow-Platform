import React, { useState } from 'react';
import { Search, Download, ArrowLeft, AlertTriangle, FileText, Sparkles, Check, X, Bookmark, RotateCcw } from 'lucide-react';
import { StatusChip } from '../components/CockpitShell';

const GROUP_STYLE = {
  SESUAI: ['Sesuai kriteria', 'info'],
  PERLU_DICEK: ['Perlu dicek', 'warning'],
  PERLU_DITINJAU: ['Perlu verifikasi', 'ai'],
  TIDAK_SESUAI: ['Tidak sesuai', 'neutral'],
};

const STATUS_STYLE = {
  MENUNGGU_KEPUTUSAN: ['Menunggu review', 'warning'],
  PERLU_DITINJAU: ['PERLU_DITINJAU', 'ai'],
  TERKONFIRMASI: ['Hadir terkonfirmasi', 'success'],
  DISETUJUI_UNDANG: ['Disetujui Undang', 'success'],
  DISETUJUI_TOLAK: ['Tidak dilanjutkan', 'neutral'],
  MENUNGGU_USER: ['Menunggu User', 'info'],
};

export function A5Candidates({ candidates, onSelectCandidate, onBulkApprove, onNavigateGate }) {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState(['cand_1', 'cand_2']);

  const filtered = candidates.filter((c) => {
    const q = search.trim().toLowerCase();
    const mSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const mGroup = groupFilter === 'ALL' || c.group === groupFilter;
    return mSearch && mGroup;
  });

  const toggle = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const eligibleBulkIds = selectedIds.filter((id) => {
    const c = candidates.find((x) => x.id === id);
    return c && c.group === 'SESUAI' && c.status === 'MENUNGGU_KEPUTUSAN';
  });
  const skippedCount = selectedIds.length - eligibleBulkIds.length;

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">Direktori Kandidat</h1>
          <p className="text-sm text-slate-500">
            {candidates.length} pelamar ditampilkan · Klik baris untuk inspeksi perbandingan Form vs CV
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => alert('Ekspor CSV UTF-8 dimulai (data disimulasikan).')}
            className="px-4 h-10 rounded-xl border border-slate-300 bg-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            Ekspor CSV
          </button>
          <button
            type="button"
            onClick={onNavigateGate}
            className="px-4 h-10 rounded-xl bg-[#172033] text-white text-xs font-semibold hover:bg-[#25324A]"
          >
            Gerbang Persetujuan →
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau kode APP..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
          />
        </div>
        {['ALL', 'SESUAI', 'PERLU_DICEK', 'PERLU_DITINJAU', 'TIDAK_SESUAI'].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroupFilter(g)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              groupFilter === g ? 'bg-[#172033] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {g === 'ALL' ? 'Semua Kelompok' : GROUP_STYLE[g][0]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
          <Search className="w-8 h-8 text-slate-400 mx-auto" strokeWidth={1.5} />
          <p className="font-display font-semibold text-base">Tidak ada kandidat yang cocok dengan filter ini</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setGroupFilter('ALL');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            Hapus semua filter
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelectedIds(e.target.checked ? filtered.map((c) => c.id) : [])}
                    className="accent-[#172033]"
                  />
                </th>
                <th className="px-4 py-3">Kandidat</th>
                <th className="px-4 py-3">Posisi & Kota</th>
                <th className="px-4 py-3">Skor Robot</th>
                <th className="px-4 py-3">Kelompok</th>
                <th className="px-4 py-3">Alasan 1-Baris</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((c) => {
                const checked = selectedIds.includes(c.id);
                const [gLbl, gKind] = GROUP_STYLE[c.group] || ['—', 'neutral'];
                const [sLbl, sKind] = STATUS_STYLE[c.status] || [c.status, 'neutral'];
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCandidate(c)}
                    className={`cursor-pointer transition ${checked ? 'bg-[#FFFBE6]' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(c.id)}
                        className="accent-[#172033]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FFF7CC] text-[#172033] font-bold flex items-center justify-center shrink-0">
                          {c.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#172033]">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#172033]">{c.jobTitle}</p>
                      <p className="text-slate-500">{c.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold tabular-nums">{c.score != null ? `${c.score} / 100` : '— (Gagal)'}</p>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.score || 0}%`,
                            backgroundColor: c.score >= 75 ? '#1D4ED8' : c.score >= 65 ? '#F59E0B' : '#94A3B8',
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip variant={gKind} dot>
                        {gLbl}
                      </StatusChip>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-600">{c.reason}</td>
                    <td className="px-4 py-3">
                      <StatusChip variant={sKind}>{sLbl}</StatusChip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 bg-[#172033] text-white px-5 py-3 rounded-2xl shadow-xl flex flex-wrap items-center gap-4">
          <StatusChip variant="yellow">{selectedIds.length} kandidat dipilih</StatusChip>
          {skippedCount > 0 && (
            <span className="text-xs text-slate-300">
              {skippedCount} kandidat (Perlu Dicek / Non-eligible) otomatis dilewati untuk tinjauan manual.
            </span>
          )}
          <button
            type="button"
            disabled={eligibleBulkIds.length === 0}
            onClick={() => {
              onBulkApprove(eligibleBulkIds);
              setSelectedIds([]);
            }}
            className="px-4 h-9 rounded-lg bg-[#FFCC00] disabled:bg-slate-600 text-[#172033] text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            Siapkan Undangan ({eligibleBulkIds.length} Sesuai)
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="px-3 h-9 rounded-lg border border-slate-600 text-xs font-semibold hover:bg-slate-800"
          >
            Batal Pilih
          </button>
        </div>
      )}
    </div>
  );
}

export function A6CandidateDetail({ candidate, onBack, onDecide }) {
  if (!candidate) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-3 h-10 rounded-xl border border-slate-300 bg-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Kembali
          </button>
          <div className="w-11 h-11 rounded-full bg-[#FFCC00] text-[#172033] font-bold flex items-center justify-center">
            {candidate.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-[#172033]">{candidate.name}</h1>
              <StatusChip variant="info" dot>
                Skor {candidate.score ?? '—'}
              </StatusChip>
            </div>
            <p className="text-xs text-slate-500">
              {candidate.jobTitle} ({candidate.city}) · {candidate.code} · {candidate.appliedAt}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onDecide(candidate.id, 'TALENT_POOL')}
            className="px-3.5 h-10 rounded-xl border border-slate-300 bg-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"
          >
            <Bookmark className="w-4 h-4" strokeWidth={1.5} />
            Talent Pool
          </button>
          <button
            type="button"
            onClick={() => onDecide(candidate.id, 'DISETUJUI_TOLAK')}
            className="px-3.5 h-10 rounded-xl border border-red-200 bg-white text-[#B91C1C] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-red-50"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
            Tolak
          </button>
          <button
            type="button"
            onClick={() => onDecide(candidate.id, 'DISETUJUI_UNDANG')}
            className="px-4 h-10 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            Setujui & Undang
          </button>
        </div>
      </div>

      {/* 3-Column Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Col 1: Form vs CV */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base">Isian Form vs Ekstraksi CV</h3>
            {candidate.mismatch && <StatusChip variant="warning">1 Selisih</StatusChip>}
          </div>
          {candidate.mismatch && (
            <div className="bg-[#FEF3C7] rounded-xl p-3 text-xs text-[#A16207] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>Kandidat mengisi pengalaman 2,5 thn di form, namun OCR mendeteksi 1,8 thn di CV (hal. 1).</span>
            </div>
          )}
          <div className="space-y-2.5">
            {(candidate.formVsCv.length > 0 ? candidate.formVsCv : [
              { field: 'Ringkasan Ekstraksi', form: 'Data formulir lengkap', cv: candidate.reason, status: 'info' },
            ]).map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border space-y-1.5 ${
                  item.status === 'diff' ? 'bg-[#FEF3C7]/60 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#172033]">{item.field}</span>
                  <StatusChip variant={item.status === 'diff' ? 'warning' : item.status === 'match' ? 'success' : 'info'}>
                    {item.status === 'diff' ? 'Selisih' : item.status === 'match' ? 'Cocok' : 'Info'}
                  </StatusChip>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p className="text-slate-400 font-semibold">ISIAN FORM</p>
                    <p className="font-semibold text-[#172033]">{item.form}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">EKSTRAKSI CV</p>
                    <p className="text-slate-600">{item.cv}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: PDF Viewer Preview */}
        <div className="bg-slate-100 rounded-xl border border-slate-200 p-3 flex flex-col gap-3">
          <div className="bg-[#172033] text-white px-3 py-2 rounded-lg flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-semibold">
              <FileText className="w-4 h-4 text-[#FFCC00]" strokeWidth={1.5} />
              CV_{candidate.name.replace(/\s+/g, '_')}.pdf
            </span>
            <span className="text-slate-300">Hal 1 / 2 · 100%</span>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 flex-1 shadow-sm">
            <div>
              <h4 className="font-display font-bold text-lg text-[#172033] uppercase">{candidate.name}</h4>
              <p className="text-xs text-slate-500">{candidate.city} · {candidate.phone} · {candidate.email}</p>
            </div>
            <hr />
            <div className="p-3 rounded-lg bg-[#FFFBE6] border border-[#FFCC00] space-y-1">
              <p className="text-[11px] font-bold text-[#172033]">SOROTAN PENGALAMAN KERJA (OCR)</p>
              <p className="text-xs font-semibold">Kasir & Crew Gerai — PT Ritel Maju Bersama</p>
              <p className="text-xs text-slate-600">• Melayani transaksi tunai, QRIS, dan debit (180 pelanggan/shift).</p>
              <p className="text-xs text-slate-600">• Melakukan stock opname harian & penataan rak.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F0EDFF] border border-purple-200 space-y-1">
              <p className="text-[11px] font-bold text-[#6656D9]">PENDIDIKAN</p>
              <p className="text-xs font-semibold">SMK Negeri 12 Jakarta — Akuntansi (2018–2021)</p>
            </div>
          </div>
        </div>

        {/* Col 3: Breakdown + AI Summary + Audit Trail */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-base">Rincian Bobot Skor</h3>
              <StatusChip variant="ai">OCR: {candidate.confidence}%</StatusChip>
            </div>
            <div className="space-y-2.5">
              {(candidate.breakdown.length > 0 ? candidate.breakdown : [
                { label: 'Skor Total', pts: `${candidate.score ?? 0} / 100`, pct: candidate.score ?? 0, color: '#1D4ED8' },
              ]).map((b) => (
                <div key={b.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{b.label}</span>
                    <span className="font-bold">{b.pts}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F0EDFF] border border-purple-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#6656D9]">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-xs font-bold">Ringkasan Otomatis (AI)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#172033]">
              {candidate.aiSummary.map((line, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-[#6656D9] font-bold">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 pt-1">
              Ringkasan dibuat otomatis. Periksa CV asli sebelum mengambil keputusan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
