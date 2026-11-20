import React, { useState } from 'react';
import { Check, AlertTriangle, Calendar, Users, Mail } from 'lucide-react';
import { StatusChip } from '../components/CockpitShell';
import { INITIAL_TEMPLATES, INITIAL_INTERVIEW_DAYS } from '../services/mockData';

export function A8Messages() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [activeId, setActiveId] = useState('tpl_invite');
  const [savedNotice, setSavedNotice] = useState('');

  const active = templates.find((t) => t.id === activeId) || templates[0];
  const missingRequired = active.requiredVar && !active.body.includes(active.requiredVar);

  const previewText = active.body
    .replaceAll('{{nama_kandidat}}', 'Budi Santoso')
    .replaceAll('{{posisi}}', 'Crew Operasional')
    .replaceAll('{{perusahaan}}', 'PT Inovasi Digital Nusantara')
    .replaceAll('{{tanggal_wib}}', 'Senin, 24 Nov 2026')
    .replaceAll('{{jam_wib}}', '10.00 WIB')
    .replaceAll('{{lokasi_atau_link}}', 'Kantor Pusat, Jl. Merdeka No. 12, Jakarta Pusat')
    .replaceAll('{{link_konfirmasi}}', 'https://karir.inovasidigital.co.id/konfirmasi/tkn_x9a7')
    .replaceAll('{{dokumen_wajib}}', 'KTP asli dan salinan CV')
    .replaceAll('{{kode_ref}}', 'APP-2026-X9A7');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">Template Komunikasi & Antrean Pesan</h1>
          <p className="text-sm text-slate-500">Editor 5 template resmi WhatsApp & Email dengan validasi variabel otomatis</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTemplates(INITIAL_TEMPLATES)}
            className="px-4 h-10 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
          >
            Reset ke Default
          </button>
          <button
            type="button"
            disabled={missingRequired}
            onClick={() => setSavedNotice(`Template "${active.label}" berhasil disimpan.`)}
            className="px-4 h-10 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] disabled:bg-slate-200 disabled:text-slate-400 text-[#172033] text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            Simpan Template
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 border-b border-slate-200">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActiveId(t.id);
              setSavedNotice('');
            }}
            className={`pb-3 border-b-[3px] text-xs font-semibold ${
              activeId === t.id ? 'border-[#FFCC00] text-[#172033]' : 'border-transparent text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {savedNotice && (
        <div className="bg-[#DCFCE7] border border-green-200 rounded-xl p-3 text-xs font-semibold text-[#15803D]">
          {savedNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base">Isi Template · {active.label}</h3>
            <StatusChip variant={missingRequired ? 'error' : 'success'} dot>
              {missingRequired ? `Wajib memuat ${active.requiredVar}` : 'Variabel kunci valid'}
            </StatusChip>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Subjek Email *</label>
            <input
              type="text"
              value={active.subject}
              onChange={(e) =>
                setTemplates((prev) => prev.map((t) => (t.id === active.id ? { ...t, subject: e.target.value } : t)))
              }
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Isi Pesan (WhatsApp & Email) *</label>
            <textarea
              rows={9}
              value={active.body}
              onChange={(e) =>
                setTemplates((prev) => prev.map((t) => (t.id === active.id ? { ...t, body: e.target.value } : t)))
              }
              className="w-full p-3 rounded-lg border border-slate-300 text-xs leading-relaxed"
            />
          </div>

          {missingRequired && (
            <div className="bg-[#FEE2E2] text-[#B91C1C] rounded-lg p-3 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>Template wajib menyertakan variabel kunci {active.requiredVar}.</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {['{{nama_kandidat}}', '{{posisi}}', '{{tanggal_wib}}', '{{jam_wib}}', '{{lokasi_atau_link}}', '{{link_konfirmasi}}'].map(
              (v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setTemplates((prev) =>
                      prev.map((t) => (t.id === active.id ? { ...t, body: `${t.body} ${v}` } : t))
                    )
                  }
                  className="px-2 py-1 rounded-full bg-slate-100 hover:bg-[#FFF7CC] text-[11px] font-semibold"
                >
                  + {v}
                </button>
              )
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base">Pratinjau (Data Simulasi)</h3>
            <StatusChip variant="info">WhatsApp / Email</StatusChip>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
            <p className="text-xs font-bold text-[#128C4A] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
              RecruitFlow Bot (PT Inovasi Digital Nusantara)
            </p>
            <p className="text-xs text-[#172033] whitespace-pre-line leading-relaxed">{previewText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function A9Slots({ onBackToCalendar }) {
  const [createdCount, setCreatedCount] = useState(0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">Pewawancara & Generator Slot</h1>
          <p className="text-sm text-slate-500">Atur ketersediaan mingguan pewawancara dan buat slot massal tanpa bentrok</p>
        </div>
        <button
          type="button"
          onClick={onBackToCalendar}
          className="px-4 h-10 rounded-xl border border-slate-300 bg-white text-xs font-semibold inline-flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" strokeWidth={1.5} />
          Kembali ke Kalender (A10)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-display font-semibold text-base">Daftar Pewawancara Aktif (4 orang)</h3>
          {[
            ['RH', 'Rina Hartono', 'HR Lead · Crew Operasional', 'Senin–Kamis, 09.00–16.00 WIB', '24 slot terisi', 'success'],
            ['BS', 'Bima Saputra', 'Store Area Manager · Crew Operasional', 'Selasa & Kamis, 10.00–15.00 WIB', '10 slot terisi', 'info'],
            ['DK', 'Dedi Kurniawan', 'CS Team Lead · Customer Service', 'Senin–Rabu, 10.00–14.00 WIB', '8 slot terisi', 'info'],
            ['AT', 'Agus Triono', 'Warehouse Head · Warehouse Staff', 'Rabu–Jumat, 09.00–15.00 WIB', 'Cuti 28 Nov', 'warning'],
          ].map(([ini, nm, role, sched, st, k]) => (
            <div key={nm} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E9EDF3] text-[#172033] font-bold text-xs flex items-center justify-center shrink-0">
                {ini}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#172033]">{nm}</p>
                <p className="text-xs text-slate-500">{role} · {sched}</p>
              </div>
              <StatusChip variant={k}>{st}</StatusChip>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-display font-semibold text-base">Generator Slot Massal</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <label className="block font-semibold mb-1">Pewawancara *</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white">
                <option>Rina Hartono (HR Lead)</option>
                <option>Bima Saputra (Area Manager)</option>
                <option>Dedi Kurniawan (CS Lead)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Tanggal Mulai</label>
              <input type="text" defaultValue="01 Des 2026" className="w-full h-10 px-3 rounded-lg border border-slate-300" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Tanggal Selesai</label>
              <input type="text" defaultValue="05 Des 2026" className="w-full h-10 px-3 rounded-lg border border-slate-300" />
            </div>
          </div>

          <div className="bg-[#FFFBE6] border border-[#FFCC00] rounded-xl p-3.5 text-xs space-y-1">
            <p className="font-bold text-[#172033]">Pratinjau Hasil Generator:</p>
            <p className="text-slate-600">• 40 slot baru akan dibuat (8 slot/hari × 5 hari kerja).</p>
            <p className="text-slate-600">• 2 slot bentrok otomatis dilewati (unique interviewer + start_time).</p>
          </div>

          {createdCount > 0 && (
            <div className="bg-[#DCFCE7] rounded-xl p-3 text-xs font-semibold text-[#15803D]">
              Berhasil membuat {createdCount} slot wawancara baru (2 slot bentrok dilewati).
            </div>
          )}

          <button
            type="button"
            onClick={() => setCreatedCount(38)}
            className="w-full h-11 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] text-xs font-semibold"
          >
            Buat 38 Slot Baru Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

export function A10Calendar({ onOpenSlots }) {
  const [days, setDays] = useState(INITIAL_INTERVIEW_DAYS);

  const badgeMap = {
    CONFIRMED: ['Terkonfirmasi', 'success', 'bg-[#DCFCE7] border-green-200'],
    PENDING: ['Menunggu 24j', 'warning', 'bg-[#FEF3C7] border-amber-300'],
    RESCHEDULE: ['Jadwal lain', 'info', 'bg-[#DBEAFE] border-blue-200'],
    AVAILABLE: ['Tersedia', 'neutral', 'bg-slate-50 border-slate-200'],
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">Jadwal & Kalender Wawancara</h1>
          <p className="text-sm text-slate-500">Minggu 24–28 Nov 2026 (Semua waktu dalam WIB) · Status ditandai warna + label teks</p>
        </div>
        <button
          type="button"
          onClick={onOpenSlots}
          className="px-4 h-10 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] text-xs font-semibold inline-flex items-center gap-2"
        >
          <Users className="w-4 h-4" strokeWidth={1.5} />
          Pewawancara & Generator Slot (A9)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {days.map((d) => (
          <div key={d.day} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <div>
              <h3 className="font-display font-semibold text-base text-[#172033]">{d.day}</h3>
              <p className="text-xs text-slate-500">{d.summary}</p>
            </div>
            <div className="space-y-2.5">
              {d.slots.map((sl) => {
                const [lbl, kind, boxCls] = badgeMap[sl.status];
                return (
                  <div key={sl.id} className={`p-3 rounded-xl border space-y-1 ${boxCls}`}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-slate-600">{sl.time}</span>
                      <StatusChip variant={kind}>{lbl}</StatusChip>
                    </div>
                    <p className="text-sm font-bold text-[#172033]">{sl.candidate}</p>
                    <p className="text-[11px] text-slate-500">{sl.meta}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
