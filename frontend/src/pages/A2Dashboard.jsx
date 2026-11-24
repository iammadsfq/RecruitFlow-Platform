import React, { useState } from 'react';
import { ArrowRight, Bot, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StatusChip } from '../components/CockpitShell';
import { AreaTrendChart, DonutChart } from '../components/Charts';
import { SakugaButton, SakugaCard } from '../components/SakugaVFX';

export default function A2Dashboard({ waitingCount, onNavigate }) {
  const [period, setPeriod] = useState('30 Hari');
  const [robotOffline, setRobotOffline] = useState(false);
  const [emptyUrgent, setEmptyUrgent] = useState(false);

  const trendData =
    period === '7 Hari'
      ? [72, 85, 91, 108, 118, 104, 126]
      : [54, 62, 58, 75, 92, 88, 110, 96, 118, 142, 126, 115, 104, 118];
  const trendLabels =
    period === '7 Hari'
      ? ['13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov']
      : ['3 Nov', '', '5 Nov', '', '7 Nov', '', '9 Nov', '', '11 Nov', '14 Nov', '', '16 Nov', '', '19 Nov'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#172033]">Selamat pagi, Rina Hartono</h1>
          <p className="text-sm text-slate-500">Ringkasan operasional rekrutmen · Diperbarui 2 menit lalu</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
            {['7 Hari', '30 Hari', 'Kuartal'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  period === p ? 'bg-white text-[#172033] shadow-sm' : 'text-slate-500'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRobotOffline(!robotOffline)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
              robotOffline ? 'bg-[#FEE2E2] border-red-200 text-[#B91C1C]' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {robotOffline ? 'Pulihkan Robot' : 'Sim. Robot Offline'}
          </button>
          <SakugaButton
            onClick={() => onNavigate('gate')}
            impactText="GATE!"
            className="px-4 h-10 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] text-xs font-semibold inline-flex items-center gap-2"
          >
            Gerbang Persetujuan ({waitingCount})
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </SakugaButton>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: `Lamaran (${period})`, val: period === '7 Hari' ? '342' : '1.248', badge: '+18,4%', kind: 'success', sub: '84 baru hari ini · 3 lowongan aktif' },
          { title: 'Menunggu review', val: String(waitingCount), badge: 'Perlu aksi', kind: 'warning', sub: '14 Perlu Dicek · 22 Sesuai Kriteria', click: 'gate' },
          { title: 'Wawancara mgg ini', val: '42', badge: '81% komit', kind: 'info', sub: '34 hadir terkonfirmasi · 8 menunggu', click: 'interviews' },
          { title: 'Tingkat kehadiran', val: '88,2%', badge: '+6,1%', kind: 'success', sub: 'Naik sejak pengingat H-1 aktif' },
        ].map((k, idx) => (
          <SakugaCard
            key={k.title}
            delay={idx * 0.05}
            onClick={k.click ? () => onNavigate(k.click) : undefined}
            className={`bg-white rounded-xl p-5 space-y-2 ${
              k.click ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">{k.title}</span>
              <StatusChip variant={k.kind}>{k.badge}</StatusChip>
            </div>
            <p className="font-display font-bold text-3xl text-[#172033] tabular-nums">{k.val}</p>
            <p className="text-xs text-slate-500">{k.sub}</p>
          </SakugaCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-[#172033]">
                Tren Lamaran Masuk & Lolos Skrining Awal
              </h3>
              <p className="text-xs text-slate-500">Arahkan kursor ke titik grafik untuk melihat volume harian (WIB)</p>
            </div>
          </div>
          <AreaTrendChart data={trendData} labels={trendLabels} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-display font-semibold text-base text-[#172033]">Komposisi Evaluasi Robot</h3>
            <p className="text-xs text-slate-500">Distribusi hasil RF_CV_Screening bulan ini</p>
          </div>
          <div className="flex items-center gap-5">
            <DonutChart
              size={136}
              centerBig="1.248"
              centerSmall="Dievaluasi"
              segments={[
                { value: 412, color: '#1D4ED8' },
                { value: 186, color: '#F59E0B' },
                { value: 64, color: '#6656D9' },
                { value: 586, color: '#CBD5E1' },
              ]}
            />
            <div className="space-y-2 text-xs flex-1">
              {[
                ['Sesuai kriteria', '33,0% (412)', '#1D4ED8'],
                ['Perlu dicek manual', '14,9% (186)', '#F59E0B'],
                ['CV perlu ditinjau', '5,1% (64)', '#6656D9'],
                ['Tidak sesuai', '47,0% (586)', '#CBD5E1'],
              ].map(([lbl, v, col]) => (
                <div key={lbl}>
                  <div className="flex items-center gap-1.5 font-semibold text-[#172033]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                    {lbl}
                  </div>
                  <p className="text-slate-500 pl-3.5 tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Funnel + Urgent Actions + Robot Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <h3 className="font-display font-semibold text-base text-[#172033]">Corong Konversi Rekrutmen</h3>
          {[
            ['1. Lamaran Diterima', '1.248 · 100%', 100, '#172033'],
            ['2. Lolos Skrining Robot', '598 · 47,9%', 48, '#1D4ED8'],
            ['3. Disetujui Approval Gate', '246 · 19,7%', 28, '#FFCC00'],
            ['4. Hadir Wawancara', '217 · 88,2%', 22, '#15803D'],
          ].map(([lbl, pct, w, col]) => (
            <div key={lbl} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#172033]">{lbl}</span>
                <span className="text-slate-500 tabular-nums">{pct}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: col }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-[#172033]">Aksi Segera</h3>
            <button
              type="button"
              onClick={() => setEmptyUrgent(!emptyUrgent)}
              className="text-[11px] font-semibold text-slate-500 underline"
            >
              {emptyUrgent ? 'Tampilkan antrean' : 'Sim. Semua Beres'}
            </button>
          </div>
          {emptyUrgent ? (
            <div className="bg-[#DCFCE7] rounded-xl p-5 text-center space-y-2">
              <CheckCircle2 className="w-7 h-7 text-[#15803D] mx-auto" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-[#15803D]">Semua beres!</p>
              <p className="text-xs text-green-800">Tidak ada tugas mendesak yang tertunda.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[
                ['14 kandidat di ambang batas (Perlu Dicek)', 'Skor 65–74 · Tinjau 1-per-1', 'Buka A7', 'gate'],
                ['6 berkas CV gagal OCR (PERLU_DITINJAU)', 'PDF scan kabur atau terkunci', 'Periksa', 'candidates'],
                ['Slot Kamis 27 Nov tersisa 2 kursi', '12 kandidat disetujui belum dapat slot', 'Atur Slot', 'interviews'],
              ].map(([t, s, cta, dest], i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#172033] truncate">{t}</p>
                    <p className="text-[11px] text-slate-500 truncate">{s}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(dest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                      i === 0 ? 'bg-[#FFCC00] text-[#172033]' : 'bg-white border border-slate-300 text-[#172033]'
                    }`}
                  >
                    {cta}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-[#172033]">Kesehatan Robot</h3>
            {robotOffline ? (
              <StatusChip variant="error" dot>
                Offline 18 mnt
              </StatusChip>
            ) : (
              <StatusChip variant="success" dot>
                Live · 12d lalu
              </StatusChip>
            )}
          </div>
          {robotOffline ? (
            <div className="bg-[#FEE2E2] rounded-xl p-4 space-y-2 text-xs text-[#B91C1C]">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
                Robot Tidak Merespons
              </div>
              <p className="text-red-900">
                Heartbeat terakhir diterima 18 menit lalu. Periksa UiPath Orchestrator.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[
                ['RF_CV_Screening', 'Aktif · 99%', 'success'],
                ['RF_Messaging', 'Aktif · 142', 'success'],
                ['RF_Scheduling', 'Standby', 'neutral'],
                ['RF_Reporting', '18.00 WIB', 'info'],
              ].map(([n, st, k]) => (
                <div key={n} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 text-xs">
                  <span className="inline-flex items-center gap-2 font-semibold text-[#172033]">
                    <Bot className="w-4 h-4" strokeWidth={1.5} />
                    {n}
                  </span>
                  <StatusChip variant={k}>{st}</StatusChip>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onNavigate('robot')}
            className="w-full h-9 rounded-lg border border-slate-300 text-xs font-semibold text-[#172033] hover:bg-slate-50"
          >
            Detail & Log Robot →
          </button>
        </div>
      </div>
    </div>
  );
}
