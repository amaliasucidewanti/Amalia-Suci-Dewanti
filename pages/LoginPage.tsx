
import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck, Key } from 'lucide-react';
import { LOGO_URL } from '../App';

interface LoginPageProps {
  onLogin: (username: string, password: string, isNewPassword?: boolean) => { success: boolean; message?: string; mustChange?: boolean };
  isLoadingData: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoadingData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mustChangeMode, setMustChangeMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoadingData) return;
    
    setError('');
    setIsSubmitting(true);
    
    setTimeout(() => {
      const result = onLogin(username, password);
      if (result.success) {
        if (result.mustChange) {
          setMustChangeMode(true);
          setIsSubmitting(false);
        }
      } else {
        setError(result.message || 'Terjadi kesalahan saat masuk.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    if (newPassword === '12345') {
      setError('Password baru tidak boleh menggunakan password default.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(username, newPassword, true);
      setIsSubmitting(false);
    }, 800);
  };

  if (mustChangeMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10 border border-slate-200 animate-in zoom-in duration-300">
          <div className="p-10 text-center bg-blue-700 text-white">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/30">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Keamanan Akun</h2>
            <p className="text-blue-100 text-xs mt-2 font-medium uppercase tracking-widest">Wajib Ganti Password Pertama Kali</p>
          </div>
          <div className="p-10">
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-xs flex items-center gap-3 font-bold animate-pulse uppercase">
                  <AlertCircle size={18} /> {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Password Baru</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Konfirmasi Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                      placeholder="Ulangi password baru"
                      required
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-[24px] transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan & Masuk Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -mr-40 -mt-40"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -ml-40 -mb-40"></div>

      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl overflow-hidden relative z-10 border border-slate-200/50 backdrop-blur-sm">
        <div className="p-12 pb-6 text-center bg-slate-50/50 border-b border-slate-100">
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-white rounded-[32px] shadow-xl border border-slate-100">
              <img src={LOGO_URL} alt="Logo BPMP" className="w-20 h-20 object-contain drop-shadow-md" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none uppercase">SI-KERTAS</h1>
          <p className="text-blue-600 font-black mt-3 uppercase text-[10px] tracking-[0.4em]">Sistem Kerja Tuntas</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-200"></span>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest italic">BPMP Maluku Utara</p>
            <span className="h-px w-8 bg-slate-200"></span>
          </div>
        </div>

        <div className="p-12 pt-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-[10px] flex items-center gap-3 font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 ml-2 uppercase tracking-widest">Username / NIP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoadingData || isSubmitting}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50/80 border-2 border-slate-100 rounded-[24px] focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-slate-800 disabled:opacity-50 font-bold"
                  placeholder="Masukkan NIP"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 ml-2 uppercase tracking-widest">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoadingData || isSubmitting}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50/80 border-2 border-slate-100 rounded-[24px] focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-slate-800 disabled:opacity-50 font-bold"
                  placeholder="Password Awal: 12345"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoadingData || isSubmitting}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-6 rounded-[30px] transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 group disabled:bg-slate-300 active:scale-95 uppercase tracking-widest text-xs"
            >
              {isSubmitting || isLoadingData ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Masuk Aplikasi
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[9px] text-slate-400 leading-relaxed font-black tracking-[0.2em] uppercase">
              © 2026 BPMP PROVINSI MALUKU UTARA<br/>
              Kementerian Pendidikan Dasar dan Menengah
            </p>
          </div>
        </div>
      </div>
      
      {isLoadingData && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl px-10 py-4 rounded-full border border-slate-200 shadow-2xl text-[10px] font-black text-blue-700 flex items-center gap-4 tracking-[0.3em] uppercase animate-pulse">
          <Loader2 size={16} className="animate-spin" />
          MENYINKRONKAN DATA SISTEM...
        </div>
      )}
    </div>
  );
};

export default LoginPage;
