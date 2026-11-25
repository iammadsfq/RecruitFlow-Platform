import React, { useState } from 'react';
import { Shield, Eye, X, Check, RotateCcw, Users } from 'lucide-react';
import { Padlock } from '@lucasmarkes/hairline/react';
import { StatusChip } from '../components/CockpitShell';
import { SakugaButton, SakugaCard } from '../components/SakugaVFX';

export default function A7Gate({ candidates, onDecide, onBulkApprove, onPreviewCandidate, role }) {
  const [activeTab, setActiveTab] = useState('PERLU_DICEK');
  const [hiringUserMode, setHiringUserMode] = useState(role === 'HIRING_USER');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [undoToast, setUndoToast] = useState(null);

  const pending = candidates.filter((c) => c.status === 'MENUNGGU_KEPUTUSAN' || c.status === 'PERLU_DITINJAU' || c.status === 'MENUNGGU_USER');

  const tabLists = {
    PERLU_DICEK: pending.filter((c) => c.group === 'PERLU_DICEK'),
    SESUAI: pending.filter((c) => c.group === 'SESUAI'),
    PERLU_DITINJAU: pending.filter((c) => c.group === 'PERLU_DITINJAU'),
    MENUNGGU_USER: candidates.filter((c) => c.status === 'MENUNGGU_USER'),
    TIDAK_SESUAI: candidates.filter((c) => c.group === 'TIDAK_SESUAI'),
  };

  const list = tabLists[activeTab] || [];

  const handleAction = (cand, status) => {
    const prevStatus = cand.status;
    onDecide(cand.id, status);
    setUndoToast({
      id: cand.id,
      name: cand.name,
      prevStatus,
      actionText:
        status === 'DISETUJUI_UNDANG'
          ? 'disetujui untuk diundang wawancara. Pesan masuk antrean pengiriman.'
          : status === 'MENUNGGU_USER'
          ? 'diteruskan ke Hiring User.'
          : 'ditandai tidak dilanjutkan.',
    });
  };

  return (
    <div className="space-y-5 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">
            Gerbang Persetujuan (Approval Gate)
          </h1>
          <p className="text-sm text-slate-500">
            Tidak ada kandidat yang dihubungi robot sebelum disetujui di halaman ini
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
            <button
              type="button"
              onClick={() => setHiringUserMode(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                !hiringUserMode ? 'bg-[#172033] text-white' : 'text-slate-600'
              }`}
            >
              Mode HR (Lengkap)
            </button>
            <button
              type="button"
              onClick={() => setHiringUserMode(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                hiringUserMode ? 'bg-[#172033] text-white' : 'text-slate-600'
              }`}
            >
              Mode Hiring User (Ringkas)
            </button>
          </div>
        </div>
      </div>

      {/* 5 Tabs */}
      <div className="flex flex-wrap items-center gap-6 border-b border-slate-200">
        {[
          ['PERLU_DICEK', 'Perlu Dicek (Default)'],
          ['SESUAI', 'Sesuai Kriteria (Bulk)'],
          ['PERLU_DITINJAU', 'Perlu Ditinjau'],
          ['MENUNGGU_USER', 'Menunggu User'],
          ['TIDAK_SESUAI', 'Tidak Sesuai'],
        ].map(([key, label]) => {
          const on = activeTab === key;
          const cnt = tabLists[key]?.length || 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`pb-3 border-b-[3px] text-xs font-semibold flex items-center gap-2 transition ${
                on ? 'border-[#FFCC00] text-[#172033]' : 'border-transparent text-slate-500 hover:text-[#172033]'
              }`}
            >
              <span>{label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums ${
                  on ? 'bg-[#FFCC00] text-[#172033]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* PRD Guardrail Banner on Perlu Dicek */}
      {activeTab === 'PERLU_DICEK' && (
        <div className="bg-[#FFFBE6] border border-[#FFCC00] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[260px]">
            <div className="hairline-theme-amber w-20 shrink-0 rounded-lg overflow-hidden">
              <Padlock play intensity={0.8} theme="light" label="Kunci Pengaman Persetujuan" className="w-full" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-[#172033] inline-flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#172033]" strokeWidth={1.75} />
                Verifikasi Manual · Tab "Perlu Dicek" (Skor Ambang 65–74)
              </p>
              <p className="text-slate-600 mt-1">
                Persetujuan massal (Bulk Approve) sengaja dikunci pada tab ini agar peninjau memeriksa alasan selisih tiap kandidat satu per satu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('SESUAI')}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold hover:bg-slate-50"
          >
            Ke Tab Sesuai Kriteria ({tabLists.SESUAI.length})
          </button>
        </div>
      )}

      {/* Bulk Approve Banner on Sesuai Kriteria */}
      {activeTab === 'SESUAI' && list.length > 0 && (
        <div className="bg-[#DBEAFE] border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-[#1D4ED8]">
            <Users className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-bold">{list.length} Kandidat "Sesuai Kriteria" Siap Disetujui Sekaligus</p>
              <p className="text-blue-900">Sisa kapasitas slot wawancara: 28 kursi (mencukupi).</p>
            </div>
          </div>
          <SakugaButton
            onClick={() => setBulkModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            Setujui Semua ({list.length})
          </SakugaButton>
        </div>
      )}

      {/* Candidate List */}
      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
          <Check className="w-8 h-8 text-[#15803D] mx-auto" strokeWidth={1.5} />
          <p className="font-display font-semibold text-base">Tidak ada kandidat di tab ini</p>
          <p className="text-xs text-slate-500">Semua kandidat pada kategori ini telah diputuskan.</p>
        </div>
      ) : (
        <div className={hiringUserMode ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
          {list.map((c, idx) => (
            <SakugaCard
              key={c.id}
              delay={idx * 0.04}
              className="bg-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-[260px]">
                <div className="w-11 h-11 rounded-full bg-[#FFF7CC] text-[#172033] font-bold text-sm flex items-center justify-center shrink-0">
                  {c.initials}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold text-base text-[#172033]">{c.name}</h3>
                    <span className="text-xs text-slate-500">{c.code} · {c.city}</span>
                    {!hiringUserMode && c.score != null && (
                      <StatusChip variant="yellow">Skor {c.score} / 100</StatusChip>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{c.reason}</p>
                  <p className="text-[11px] text-slate-400">{c.cvNote}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPreviewCandidate(c)}
                  className="px-3 h-9 rounded-lg border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"
                >
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Lihat CV
                </button>
                {activeTab !== 'TIDAK_SESUAI' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction(c, 'DISETUJUI_TOLAK')}
                      className="px-3 h-9 rounded-lg border border-red-200 text-[#B91C1C] text-xs font-semibold inline-flex items-center gap-1 hover:bg-red-50"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Tolak
                    </button>
                    {!hiringUserMode && activeTab !== 'MENUNGGU_USER' && (
                      <button
                        type="button"
                        onClick={() => handleAction(c, 'MENUNGGU_USER')}
                        className="px-3 h-9 rounded-lg bg-[#172033] text-white text-xs font-semibold hover:bg-[#25324A]"
                      >
                        Ke User
                      </button>
                    )}
                    <SakugaButton
                      disabled={activeTab === 'PERLU_DITINJAU'}
                      onClick={() => handleAction(c, 'DISETUJUI_UNDANG')}
                      className="px-3.5 h-9 rounded-lg bg-[#FFCC00] hover:bg-[#F2BE00] disabled:bg-slate-200 disabled:text-slate-400 text-[#172033] text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={2} />
                      Setujui Undang
                    </SakugaButton>
                  </>
                )}
              </div>
            </SakugaCard>
          ))}
        </div>
      )}

      {/* Bulk Approve Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-display font-bold text-lg text-[#172033]">Konfirmasi Persetujuan Massal</h3>
            <p className="text-sm text-slate-600">
              Setelah dikonfirmasi, robot akan mengirimkan undangan wawancara WhatsApp &amp; email ke{' '}
              <span className="font-bold text-[#172033]">{list.length} kandidat</span> kelompok "Sesuai Kriteria".
            </p>
            <div className="bg-[#DCFCE7] rounded-xl p-3 text-xs font-semibold text-[#15803D]">
              Kapasitas slot mencukupi: Tersedia 28 kursi wawancara.
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkApprove(list.map((c) => c.id));
                  setBulkModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#FFCC00] text-[#172033] text-xs font-semibold"
              >
                Ya, Setujui & Kirim Undangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#172033] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4">
          <Check className="w-4 h-4 text-[#FFCC00]" strokeWidth={2} />
          <span className="text-xs">
            <span className="font-bold">{undoToast.name}</span> {undoToast.actionText}
          </span>
          <button
            type="button"
            onClick={() => {
              onDecide(undoToast.id, undoToast.prevStatus);
              setUndoToast(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#FFCC00] text-[#172033] text-xs font-semibold inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
            Urungkan (Undo)
          </button>
          <button type="button" onClick={() => setUndoToast(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
