import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hub, Sieve, Vault, Slow, Plot } from '@lucasmarkes/hairline/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { LogoMark } from '../components/CockpitShell';
import { SakugaButton } from '../components/SakugaVFX';

gsap.registerPlugin(ScrollTrigger);

const PIPELINE_STEPS = [
  {
    step: '01',
    Figure: Sieve,
    title: 'Ekstraksi & Skoring CV',
    tag: 'Tahap 01',
    desc: 'Membaca PDF CV, mencocokkan sinonim keahlian, dan menandai selisih isian formulir terhadap dokumen asli.',
  },
  {
    step: '02',
    Figure: Vault,
    title: 'Gerbang Persetujuan HR',
    tag: 'Tahap 02',
    desc: 'Keputusan tetap di tangan HR dan Hiring User. Kandidat dengan skor meragukan dikunci dari persetujuan massal.',
  },
  {
    step: '03',
    Figure: Slow,
    title: 'Penjadwalan & Notifikasi',
    tag: 'Tahap 03',
    desc: 'Mengunci slot wawancara anti-bentrok dan mengirimkan tautan konfirmasi satu klik ke kandidat yang disetujui.',
  },
  {
    step: '04',
    Figure: Plot,
    title: 'Pelaporan & Telemetri',
    tag: 'Tahap 04',
    desc: 'Merekam log aktivitas robot tanpa data pribadi (PII) serta menyusun rekap efisiensi rekrutmen harian.',
  },
];

export default function Landing({ onProceed }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero-stagger', {
        y: 16,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
      });

      gsap.from('.gsap-pipeline-row', {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.gsap-pipeline-section',
          start: 'top 85%',
          once: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-[#0F172A] text-white selection:bg-[#FFCC00] selection:text-[#172033]">
      {/* Compact Single-Row Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0F172A]/90 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <p className="font-display font-bold text-base leading-tight">RecruitFlow</p>
              <p className="text-[11px] text-slate-400">HR Cockpit &amp; UiPath Automation</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              4 Worker UiPath Terhubung
            </span>
            <SakugaButton
              onClick={onProceed}
              className="px-4 h-9 rounded-lg bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              Buka Cockpit HR
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </SakugaButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-14 lg:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="gsap-hero-stagger border-l-2 border-[#FFCC00] pl-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#FFCC00]">
              UiPath RPA · Human-in-the-Lead Governance
            </p>

            <h1 className="gsap-hero-stagger font-display font-extrabold text-4xl sm:text-5xl lg:text-[52px] leading-[1.08] tracking-tight">
              Skrining CV otomatis.{' '}
              <span className="text-[#FFCC00]">Keputusan akhir tetap di HR.</span>
            </h1>

            <p className="gsap-hero-stagger text-base text-slate-300 leading-relaxed max-w-xl">
              RecruitFlow memisahkan pekerjaan repetitif—ekstraksi PDF, pencocokan kriteria, dan penjadwalan slot—ke robot <strong className="text-white">UiPath RPA</strong>, sementara seluruh persetujuan kandidat dikendalikan melalui Gerbang Persetujuan HR.
            </p>

            <div className="gsap-hero-stagger flex flex-wrap items-center gap-3 pt-2">
              <SakugaButton
                onClick={onProceed}
                className="px-6 h-11 rounded-lg bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] font-bold text-sm inline-flex items-center gap-2 transition-colors"
              >
                Masuk ke Cockpit HR
                <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
              </SakugaButton>

              <motion.a
                href="#arsitektur"
                whileHover={{ y: -1 }}
                className="px-5 h-11 rounded-lg border border-white/15 hover:border-white/30 text-slate-200 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
              >
                Alur Kerja Sistem
                <ChevronDown className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
              </motion.a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#172033] p-4">
            <div className="hairline-theme-navy rounded-lg overflow-hidden bg-[#172033]">
              <Hub
                play
                intensity={0.8}
                theme="dark"
                label="Orkestrasi Hub RecruitFlow UiPath"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Clean Architectural Key Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10 mt-16">
          {[
            ['86,4%', 'Efisiensi Waktu Skrining', 'Dari ~3,5 menit manual menjadi beberapa detik per CV'],
            ['100%', 'Otorisasi Gerbang Persetujuan', 'Tidak ada undangan terkirim tanpa persetujuan HR'],
            ['4 Proses', 'Worker UiPath Terpadu', 'Screening, Messaging, Scheduling, dan Reporting'],
          ].map(([big, title, sub]) => (
            <div key={title} className="py-6 sm:px-6 first:sm:pl-0 last:sm:pr-0 space-y-1">
              <p className="font-display font-extrabold text-3xl text-[#FFCC00] tabular-nums">{big}</p>
              <p className="font-display font-semibold text-sm text-white">{title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Stage Pipeline — Editorial Grid with Hairline Dividers */}
      <section id="arsitektur" className="gsap-pipeline-section max-w-6xl mx-auto px-6 pb-20 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FFCC00]">Arsitektur Sistem</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl">
              Empat Tahap Kolaborasi Robot &amp; HR
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-white/10 rounded-xl divide-y md:divide-y-0 md:divide-x divide-white/10 bg-[#172033]/60 overflow-hidden">
          {PIPELINE_STEPS.map((item) => {
            const Figure = item.Figure;
            return (
              <div key={item.step} className="gsap-pipeline-row p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#FFCC00]">{item.tag}</span>
                    <span className="font-mono text-slate-500">{item.step}</span>
                  </div>
                  <div className="hairline-theme-navy rounded-lg bg-[#172033] overflow-hidden border border-white/5">
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
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
