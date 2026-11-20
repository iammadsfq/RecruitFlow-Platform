import React, { useState } from 'react';
import { Plus, Search, AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import { StatusChip } from '../components/CockpitShell';

export function A3Jobs({ jobs, onSelectJobCriteria, onDuplicateJob, onCloseJob }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [closeModalJob, setCloseModalJob] = useState(null);

  const filtered = jobs.filter((j) => {
    const mSearch = !search || j.title.toLowerCase().includes(search.toLowerCase());
    const mStatus = statusFilter === 'ALL' || j.status === statusFilter;
    return mSearch && mStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">Manajemen Lowongan</h1>
          <p className="text-sm text-slate-500">Kelola siklus hidup lowongan, kuota, batas waktu, dan kriteria robot</p>
        </div>
        <button
          type="button"
          onClick={() => onSelectJobCriteria(jobs[0])}
          className="px-4 h-10 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] text-xs font-semibold inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Buat Lowongan Baru
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul posisi..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
          />
        </div>
        {['ALL', 'OPEN', 'DRAFT', 'CLOSED'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === st ? 'bg-[#172033] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {st === 'ALL' ? 'Semua' : st}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Posisi & Lokasi</th>
              <th className="px-4 py-3">Departemen & Mode</th>
              <th className="px-4 py-3">Kuota & Pelamar</th>
              <th className="px-4 py-3">Menunggu Review</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#172033]">{j.title}</p>
                  <p className="text-xs text-slate-500">{j.location} · {j.type}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-[#172033]">{j.department}</p>
                  <p className="text-[11px] text-slate-500">{j.approvalMode} · {j.hiringScale}</p>
                </td>
                <td className="px-4 py-3 text-xs">
                  <p className="font-semibold">{j.quota} kursi · {j.applicants} pelamar</p>
                  <p className="text-slate-500">Tutup {j.deadline}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusChip variant={j.waitingReview > 0 ? 'warning' : 'neutral'}>
                    {j.waitingReview > 0 ? `${j.waitingReview} kandidat` : '—'}
                  </StatusChip>
                </td>
                <td className="px-4 py-3">
                  <StatusChip
                    variant={j.status === 'OPEN' ? 'success' : 'neutral'}
                    dot
                  >
                    {j.status === 'OPEN' ? 'Dibuka' : j.status === 'DRAFT' ? 'Draft' : 'Ditutup'}
                  </StatusChip>
                </td>
                <td className="px-4 py-3 text-right space-x-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectJobCriteria(j)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-100"
                  >
                    Kriteria
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateJob(j)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-100 inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" strokeWidth={1.5} />
                    Duplikat
                  </button>
                  {j.status === 'OPEN' && (
                    <button
                      type="button"
                      onClick={() => setCloseModalJob(j)}
                      className="px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-[#B91C1C] hover:bg-red-50"
                    >
                      Tutup
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {closeModalJob && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#A16207]">
              <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
              <h3 className="font-display font-bold text-lg">Yakin menutup "{closeModalJob.title}"?</h3>
            </div>
            <p className="text-sm text-slate-600">
              Masih ada <span className="font-semibold text-[#172033]">{closeModalJob.waitingReview} kandidat</span> menunggu keputusan di Approval Gate. Lowongan yang sudah memiliki pelamar tidak dapat dihapus permanen, hanya ditutup/diarsipkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCloseModalJob(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseJob(closeModalJob.id);
                  setCloseModalJob(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] text-white text-xs font-semibold"
              >
                Tetap Tutup & Arsipkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function A4Criteria({ job, onBack }) {
  const [weights, setWeights] = useState([
    { key: 'skills', label: 'Keahlian Wajib & Sinonim CV', weight: 30, color: '#FFCC00' },
    { key: 'experience', label: 'Durasi Pengalaman Kerja Relevan', weight: 30, color: '#1D4ED8' },
    { key: 'education', label: 'Kesesuaian Pendidikan', weight: 20, color: '#172033' },
    { key: 'screening', label: 'Jawaban Pertanyaan Screening', weight: 20, color: '#6656D9' },
  ]);
  const [savedMsg, setSavedMsg] = useState('');

  const totalWeight = weights.reduce((s, w) => s + Number(w.weight || 0), 0);
  const validWeight = totalWeight === 100;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">
            Konfigurasi Kriteria Robot · {job?.title || 'Crew Operasional'}
          </h1>
          <p className="text-sm text-slate-500">
            Status: {job?.status || 'OPEN'} ({job?.applicants || 240} pelamar aktif) · Mode: {job?.approvalMode || 'HR_AND_USER'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 h-10 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
          >
            Kembali ke Daftar
          </button>
          <button
            type="button"
            disabled={!validWeight}
            onClick={() => setSavedMsg('Kriteria disimpan & tugas Rescore dikirim ke RF_CV_Screening!')}
            className="px-4 h-10 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] disabled:bg-slate-200 disabled:text-slate-400 text-[#172033] text-xs font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
            Simpan & Rescore ({job?.applicants || 240} CV)
          </button>
        </div>
      </div>

      {/* BR-12 Warning */}
      <div className="bg-[#FEF3C7] border border-amber-300 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#A16207] shrink-0 mt-0.5" strokeWidth={1.5} />
        <div className="text-xs text-amber-900">
          <p className="font-bold text-[#A16207]">Perhatian (BR-12): Lowongan ini sudah memiliki {job?.applicants || 240} pelamar aktif</p>
          <p className="mt-0.5">Mengubah syarat knock-out atau bobot kriteria akan menandai kandidat yang belum final untuk dihitung ulang (Rescore) oleh robot.</p>
        </div>
      </div>

      {savedMsg && (
        <div className="bg-[#DCFCE7] border border-green-200 rounded-xl p-3 text-xs font-semibold text-[#15803D] flex items-center gap-2">
          <Check className="w-4 h-4" strokeWidth={2} />
          {savedMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-display font-semibold text-base text-[#172033]">A. Syarat Mutlak (Knock-Out Criteria)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Pendidikan Min. *</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs bg-white">
                <option>SMA / SMK Sederajat</option>
                <option>D3</option>
                <option>S1</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Pengalaman Min. (Thn) *</label>
              <input type="number" step="0.5" defaultValue="2.0" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Wajib Penempatan Jakarta?</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs bg-white">
                <option>Ya, wajib (Knock-out)</option>
                <option>Tidak wajib</option>
              </select>
            </div>
          </div>

          <h3 className="font-display font-semibold text-base text-[#172033] pt-2">B. Kamus Keahlian Wajib & Sinonim</h3>
          {[
            ['Operasional Kasir / POS', ['Point of Sale', 'Mesin Kasir', 'Transaksi Tunai/QRIS', 'Kasir Ritel'], 'Wajib'],
            ['Manajemen Stok Gerai', ['Stock Opname', 'Inventory Harian', 'Display Barang'], 'Wajib'],
          ].map(([sk, syns, kind]) => (
            <div key={sk} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033]">{sk}</span>
                <StatusChip variant="yellow">{kind}</StatusChip>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {syns.map((s) => (
                  <StatusChip key={s} variant="neutral">
                    {s}
                  </StatusChip>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-[#172033]">C. Bobot Penilaian</h3>
            <StatusChip variant={validWeight ? 'success' : 'error'} dot>
              Total: {totalWeight}% {validWeight ? '(Valid)' : `(Selisih ${100 - totalWeight}%)`}
            </StatusChip>
          </div>
          <p className="text-xs text-slate-500">Total bobot wajib tepat 100% agar tombol simpan aktif.</p>
          <div className="space-y-3">
            {weights.map((w, idx) => (
              <div key={w.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{w.label}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={w.weight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value || '0', 10);
                      setWeights((prev) => prev.map((it, i) => (i === idx ? { ...it, weight: val } : it)));
                    }}
                    className="w-16 h-7 px-2 rounded border border-slate-300 text-right font-bold tabular-nums"
                  />
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, w.weight)}%`, backgroundColor: w.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
