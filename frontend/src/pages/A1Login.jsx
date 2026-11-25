import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { LogoMark, StatusChip } from '../components/CockpitShell';
import { loginStaff } from '../services/api';

export default function A1Login({ onLogin }) {
  const [email, setEmail] = useState('hr@recruitflow.id');
  const [password, setPassword] = useState('••••••••••••');
  const [showPw, setShowPw] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleKeyEvent = (e) => {
    if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email atau kata sandi tidak sesuai. Periksa kembali kredensial Anda.');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await loginStaff(email, password, 'ADMIN');
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message || 'Email atau kata sandi tidak sesuai. Periksa kembali kredensial Anda.');
      return;
    }
    onLogin(res.user?.role || 'ADMIN');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left Brand Panel */}
      <div className="bg-[#172033] text-white p-10 lg:p-14 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <LogoMark size={44} />
          <div>
            <p className="font-display font-bold text-xl">RecruitFlow</p>
            <p className="text-xs text-slate-400">Human-in-the-Loop Recruitment Cockpit</p>
          </div>
        </div>

        <div className="space-y-4 my-8">
          <StatusChip variant="yellow">UiPath RPA × Human Approval Gate</StatusChip>
          <h1 className="font-display font-bold text-4xl leading-tight">
            Fokus pada orangnya.
            <br />
            Bukan kerja repetitifnya.
          </h1>
          <p className="text-slate-300 text-base max-w-md leading-relaxed">
            Robot mengekstrak CV, menghitung kecocokan kriteria, dan menyiapkan jadwal. Keputusan siapa yang diundang tetap 100% di tangan manusia.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            ['≥ 84%', 'Hemat waktu skrining awal'],
            ['100%', 'Keputusan lewat Approval Gate'],
            ['4 Proses', 'Robot UiPath terpantau live'],
          ].map(([big, sm]) => (
            <div key={big} className="bg-[#25324A] rounded-xl p-4">
              <p className="font-display font-bold text-xl text-[#FFCC00]">{big}</p>
              <p className="text-xs text-slate-300 mt-1">{sm}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Login Card */}
      <div className="flex items-center justify-center p-6 lg:p-14">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-md space-y-5">
          <div>
            <h2 className="font-display font-bold text-2xl text-[#172033]">Masuk ke Cockpit Staf</h2>
            <p className="text-sm text-slate-500 mt-1">
              Gunakan akun staf perusahaan. Anda akan diarahkan sesuai peran akses.
            </p>
          </div>

          {error && (
            <div className="bg-[#FEE2E2] border border-red-200 text-[#B91C1C] rounded-xl p-3 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#172033] mb-1">Email perusahaan *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#172033] mb-1">Kata sandi *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyEvent}
                  onKeyUp={handleKeyEvent}
                  className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#172033]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {capsLock && (
              <div className="bg-[#FEF3C7] text-[#A16207] rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Caps Lock terdeteksi aktif. Periksa kembali huruf besar/kecil kata sandi.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#FFCC00] hover:bg-[#F2BE00] text-[#172033] font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              Masuk ke Cockpit
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <p className="text-xs text-slate-500">Simulasi pengarahan berbasis peran (klik untuk langsung masuk):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onLogin('ADMIN')}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-[#172033] hover:bg-slate-50"
              >
                HR / Admin → Dashboard
              </button>
              <button
                type="button"
                onClick={() => onLogin('HIRING_USER')}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-[#172033] hover:bg-slate-50"
              >
                Hiring User → Persetujuan
              </button>
              <button
                type="button"
                onClick={() => onLogin('INTERVIEWER')}
                className="col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-[#172033] hover:bg-slate-50"
              >
                Interviewer → Jadwal Saya (I1)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
