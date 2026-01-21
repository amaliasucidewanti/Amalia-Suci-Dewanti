
import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { LOGO_URL } from '../App';

interface LoginPageProps {
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  isLoadingData: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoadingData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoadingData) return;
    
    setError('');
    setIsSubmitting(true);
    
    // Sedikit delay untuk efek UI
    setTimeout(() => {
      const result = onLogin(username, password);
      if (!result.success) {
        setError(result.message || 'Terjadi kesalahan saat masuk.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -ml-20 -mb-20"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200">
        <div className="p-8 pb-4 text-center border-b border-slate-50 bg-slate-50/50">
          <div className="mb-6 flex justify-center">
            <img src={LOGO_URL} alt="Logo BPMP" className="w-24 h-24 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">SI-KERTAS</h1>
          <p className="text-blue-600 font-bold mt-1 uppercase text-xs tracking-widest">Sistem Kerja Tuntas</p>
          <p className="text-slate-500 text-sm mt-3 font-medium italic">“Setiap Pegawai Jelas Tugasnya”</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 font-semibold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username / NIP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoadingData || isSubmitting}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-slate-800 disabled:opacity-50 font-medium"
                  placeholder="Admin atau NIP Pegawai"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoadingData || isSubmitting}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-slate-800 disabled:opacity-50 font-medium"
                  placeholder="Sandi Default: 12345"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoadingData || isSubmitting}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group disabled:bg-slate-400 active:scale-95"
            >
              {isSubmitting || isLoadingData ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Masuk Aplikasi
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 leading-relaxed font-bold tracking-widest uppercase">
              © 2026 BPMP PROVINSI MALUKU UTARA<br/>
              Kementerian Pendidikan Dasar dan Menengah
            </p>
          </div>
        </div>
      </div>
      
      {isLoadingData && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2.5 rounded-full border border-slate-200 shadow-xl text-[10px] font-black text-blue-700 flex items-center gap-3 tracking-widest uppercase">
          <Loader2 size={12} className="animate-spin" />
          MENYINKRONKAN DATA MASTER...
        </div>
      )}
    </div>
  );
};

export default LoginPage;
