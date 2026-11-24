import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hub, Sieve, Vault, Slow, Terminal } from '@lucasmarkes/hairline/react';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { LogoMark } from '../components/CockpitShell';
import { SakugaButton } from '../components/SakugaVFX';

gsap.registerPlugin(ScrollTrigger);

const PIPELINE_STEPS = [
  {
    step: '01',
    Figure: Sieve,
    title: 'RF_CV_Screening',
    tag: 'Ekstraksi & Skoring Otomatis',
    desc: 'Robot UiPath membaca PDF CV, menyaring sinonim keahlian, dan mendeteksi selisih formulir vs CV dalam 4,2 detik.',
  },
  {
    step: '02',
    Figure: Vault,
    title: 'Approval Gate (BR-01)',
    tag: 'Human-in-the-Lead',
    desc: 'Keputusan tetap 100% di tangan HR & Hiring User. Tab "Perlu Dicek" mengunci persetujuan massal tanpa verifikasi manusia.',
  },
  {
    step: '03',
    Figure: Slow,
    title: 'RF_Scheduling & Messaging',
    tag: 'Slot Anti-Bentrok',
    desc: 'Setelah disetujui, robot mengunci slot wawancara tanpa bentrok dan mengirim tautan konfirmasi 1-klik ke kandidat.',
  },
  {
    step: '04',
    Figure: Terminal,
    title: 'RF_Reporting & Live Telemetry',
    tag: 'Audit & Privasi PII',
    desc: 'Seluruh aktivitas robot terpantau real-time dengan penyamaran PII dan laporan efisiensi harian otomatis.',
  },
];

export default function Landing({ onProceed }) {
  const rootRef = useRef(null);
  const [hubReadout, setHubReadout] = useState('Arahkan kursor ke figur Hairline');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero-stagger', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
      });

      gsap.from('.gsap-stat-card', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        delay: 0.35,
        ease: 'power2.out',
      });

      gsap.from('.gsap-pipeline-card', {
        y: 36,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.gsap-pipeline-section',
          start: 'top 82%',
          once: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-[#0F172A] text-white hairline-grid-dark selection:bg-[#FFCC00] selection:text-[#172033]">
      {/* Top Hairline Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0F172A]/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <p className="font-display font-bold text-base leading-tight">RecruitFlow</p>
              <p className="text-[11px] text-slate-400">UiPath RPA × Human Approval Gate</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hairline-dark text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              4 Robot UiPath Siap
            </span>
            <SakugaButton
              onClick={onProceed}
              impactText="GO!"
              className="px-4 h-9 rounded-lg bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] font-semibold text-xs inline-flex items-center gap-1.5"
            >
              Buka Cockpit HR
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </SakugaButton>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive @lucasmarkes/hairline Hub Figure */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="gsap-hero-stagger inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFCC00]/10 text-[#FFCC00] hairline-dark text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
              Automasi Rekrutmen End-to-End · Human-in-the-Lead
            </div>

            <h1 className="gsap-hero-stagger font-display font-extrabold text-4xl sm:text-5xl lg:text-[54px] leading-[1.08] tracking-tight">
              Skrining 100 CV dalam hitungan menit.{' '}
              <span className="text-[#FFCC00]">Keputusan tetap di tangan HR.</span>
            </h1>

            <p className="gsap-hero-stagger text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              RecruitFlow menggabungkan kecepatan robot <strong className="text-white">UiPath RPA</strong> untuk ekstraksi CV, penilaian kriteria, dan penjadwalan otomatis dengan <strong className="text-white">Gerbang Persetujuan (BR-01)</strong> yang transparan dan bebas bias.
            </p>

            <div className="gsap-hero-stagger flex flex-wrap items-center gap-3 pt-2">
              <SakugaButton
                onClick={onProceed}
                impactText="LAUNCH!"
                className="px-6 h-12 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-[#FFCC00]/15"
              >
                Masuk ke Cockpit HR
                <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
              </SakugaButton>

              <motion.a
                href="#arsitektur"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 h-12 rounded-xl bg-white/5 hover:bg-white/10 hairline-dark text-white font-semibold text-sm inline-flex items-center gap-2 transition"
              >
                Lihat Alur Robot
                <ChevronDown className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
              </motion.a>
            </div>
          </div>

          {/* Interactive Hairline Isometric Hub */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 rounded-2xl bg-[#172033]/85 hairline-dark p-5 space-y-3"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-[#FFCC00] font-semibold">ORCHESTRATOR HUB · INTERAKTIF</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{hubReadout || 'standby'}</span>
            </div>
            <div className="hairline-theme-navy rounded-xl overflow-hidden bg-[#172033] p-2">
              <Hub
                play
                intensity={0.85}
                theme="dark"
                label="Orkestrasi Hub RecruitFlow UiPath"
                onRead={(txt) => setHubReadout(txt)}
                className="w-full"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Gerakkan kursor di atas figur isometrik untuk melihat respons node orkestrasi
            </p>
          </motion.div>
        </div>

        {/* Hairline Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14">
          {[
            ['86,4%', 'Penghematan Waktu Skrining', 'Dari 3,5 menit manual menjadi 4,2 detik per CV'],
            ['100%', 'Kepatuhan Approval Gate (BR-01)', 'Zero pesan terkirim tanpa otorisasi HR / User'],
            ['4 Proses', 'Orkestrasi Robot UiPath', 'Screening, Messaging, Scheduling, & Reporting'],
          ].map(([big, title, sub]) => (
            <motion.div
              key={title}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="gsap-stat-card rounded-2xl bg-[#172033]/90 p-5 hairline-dark space-y-1.5"
            >
              <p className="font-display font-extrabold text-3xl text-[#FFCC00] tabular-nums">{big}</p>
              <p className="font-display font-semibold text-sm text-white">{title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="hairline-divider-dark" />
      </div>

      {/* Scroll-triggered 4-Stage Pipeline with @lucasmarkes/hairline Figures */}
      <section id="arsitektur" className="gsap-pipeline-section max-w-6xl mx-auto px-6 py-20 space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FFCC00]">Arsitektur Automasi</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl">
              4 Tahap Kolaborasi Robot & Manusia
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Setiap tahap dilengkapi figur isometrik interaktif—arahkan kursor ke kartu untuk mengeksplorasi alur kerja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE_STEPS.map((item) => {
            const Figure = item.Figure;
            return (
              <motion.div
                key={item.step}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="gsap-pipeline-card rounded-2xl bg-[#172033]/90 p-5 hairline-dark flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#FFCC00]">{item.tag}</span>
                    <span className="font-mono text-xs font-bold text-slate-500">{item.step}</span>
                  </div>
                  <div className="hairline-theme-navy rounded-xl bg-[#172033] overflow-hidden">
                    <Figure
                      play
                      intensity={0.75}
                      theme="dark"
                      label={item.title}
                      className="w-full"
                    />
                  </div>
                  <h3 className="font-display font-bold text-base text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-[#172033] via-[#1E293B] to-[#172033] p-8 hairline-dark flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-xl">Siap mencoba simulasi Cockpit HR?</h3>
            <p className="text-sm text-slate-300">
              Uji alur persetujuan kandidat, monitoring robot UiPath, hingga pengaturan bobot skoring secara interaktif.
            </p>
          </div>
          <SakugaButton
            onClick={onProceed}
            impactText="READY!"
            className="px-6 h-11 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] font-bold text-sm inline-flex items-center gap-2"
          >
            Mulai Sekarang
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </SakugaButton>
        </div>
      </section>
    </div>
  );
}
