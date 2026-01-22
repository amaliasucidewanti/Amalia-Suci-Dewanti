
import React, { useState, useMemo } from 'react';
import { 
  Employee, 
  UserRole, 
  AccountStatus, 
  ResetLog 
} from '../types';
import { 
  Search, 
  KeyRound, 
  ShieldAlert, 
  UserX, 
  History, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Filter,
  ArrowRightCircle
} from 'lucide-react';

interface ResetPasswordPageProps {
  employees: Employee[];
  currentUser: any;
  onUpdateEmployee: (emp: Partial<Employee>) => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ employees, currentUser, onUpdateEmployee }) => {
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdminTim = currentUser?.role === UserRole.ADMIN_TIM;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [confirmModal, setConfirmModal] = useState<Employee | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [resetLogs, setResetLogs] = useState<ResetLog[]>([]);
  const [resetReason, setResetReason] = useState('');

  const units = useMemo(() => {
    const u = new Set(employees.map(e => e.unit));
    return ['All', ...Array.from(u)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    let result = employees;

    // Filter by unit if not Super Admin
    if (!isSuperAdmin) {
      result = result.filter(e => e.unit === currentUser.unit);
    } else if (selectedUnit !== 'All') {
      result = result.filter(e => e.unit === selectedUnit);
    }

    // Don't allow Admin to reset Super Admin
    if (!isSuperAdmin) {
      result = result.filter(e => e.nip !== 'Admin');
    }

    if (searchQuery) {
      result = result.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.nip.includes(searchQuery)
      );
    }

    return result;
  }, [employees, searchQuery, selectedUnit, isSuperAdmin, currentUser]);

  const handleReset = () => {
    if (!confirmModal) return;

    const log: ResetLog = {
      targetName: confirmModal.name,
      targetNip: confirmModal.nip,
      adminName: currentUser.name,
      timestamp: new Date().toLocaleString('id-ID'),
      reason: resetReason || 'Permintaan Lupa Password'
    };

    setResetLogs(prev => [log, ...prev]);
    onUpdateEmployee({
      nip: confirmModal.nip,
      accountStatus: AccountStatus.MUST_CHANGE,
      lastReset: log.timestamp
    });

    setConfirmModal(null);
    setResetReason('');
  };

  const handleLockAccount = (emp: Employee) => {
    const isLocking = emp.accountStatus !== AccountStatus.LOCKED;
    if (window.confirm(`${isLocking ? 'Kunci' : 'Aktifkan'} akun ${emp.name}?`)) {
      onUpdateEmployee({
        nip: emp.nip,
        accountStatus: isLocking ? AccountStatus.LOCKED : AccountStatus.ACTIVE
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Reset Password Pegawai</h3>
          <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={16} className="text-blue-600" />
            Pengelolaan Akses Akun SI-KERTAS
          </p>
        </div>
        <button 
          onClick={() => setShowHistory(true)}
          className="relative z-10 flex items-center gap-3 px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200"
        >
          <History size={18} /> Riwayat Audit
        </button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari Nama atau NIP..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
            {isSuperAdmin && (
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                >
                  {units.map(u => <option key={u} value={u}>{u === 'All' ? 'Semua Unit Kerja' : u}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-widest">
                    <th className="px-10 py-6">Pegawai</th>
                    <th className="px-10 py-6">Unit / Jabatan</th>
                    <th className="px-10 py-6">Status Akun</th>
                    <th className="px-10 py-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.nip} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${
                            emp.accountStatus === AccountStatus.LOCKED ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm uppercase">{emp.name}</p>
                            <p className="text-[10px] font-mono font-bold text-slate-400">{emp.nip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase">{emp.unit}</p>
                        <p className="text-[10px] text-slate-400 font-bold italic">{emp.position}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          emp.accountStatus === AccountStatus.LOCKED ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          emp.accountStatus === AccountStatus.MUST_CHANGE ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {emp.accountStatus || AccountStatus.ACTIVE}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setConfirmModal(emp)}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Reset Password"
                          >
                            <KeyRound size={20} />
                          </button>
                          <button 
                            onClick={() => handleLockAccount(emp)}
                            className={`p-3 rounded-xl transition-all ${
                              emp.accountStatus === AccountStatus.LOCKED ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'
                            }`}
                            title={emp.accountStatus === AccountStatus.LOCKED ? "Aktifkan Akun" : "Kunci Akun"}
                          >
                            <UserX size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-700 p-10 rounded-[40px] text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Pusat Keamanan</h4>
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-200">Total Akun</p>
                <p className="text-2xl font-black">{employees.length}</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-rose-200">Akun Terkunci</p>
                <p className="text-2xl font-black">{employees.filter(e => e.accountStatus === AccountStatus.LOCKED).length}</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
             <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
               <ShieldAlert size={16} className="text-amber-500" /> Aturan Reset
             </h5>
             <ul className="space-y-4 text-[11px] font-medium text-slate-600 leading-relaxed">
               <li className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                 <span>Password default hasil reset adalah <b>12345</b></span>
               </li>
               <li className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                 <span>Status akun akan berubah menjadi <b>Wajib Ganti Password</b></span>
               </li>
               <li className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                 <span>Seluruh aktivitas reset dicatat dalam <b>Audit Trail</b></span>
               </li>
             </ul>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in duration-300">
             <div className="p-10 text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100">
                   <KeyRound size={48} className="text-blue-700" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Konfirmasi Reset</h4>
                <p className="text-slate-500 text-sm mt-3 px-8">Anda akan mereset password akun <b>{confirmModal.name}</b> menjadi <b>12345</b>. Tindakan ini tidak dapat dibatalkan.</p>
                
                <div className="mt-8 text-left space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Alasan Reset (Opsional)</label>
                   <input 
                    type="text" 
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    placeholder="Contoh: Lupa password / Permintaan pribadi"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600"
                   />
                </div>
             </div>
             <div className="p-8 bg-slate-50 flex gap-4">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Batal</button>
                <button onClick={handleReset} className="flex-1 py-4 bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all">Reset Password</button>
             </div>
          </div>
        </div>
      )}

      {/* History Slide-over */}
      {showHistory && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Audit Trail</h4>
                <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-1">Riwayat Reset Password</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-3 hover:bg-slate-50 rounded-full text-slate-400"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-6">
              {resetLogs.length > 0 ? resetLogs.map((log, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex gap-5 group hover:border-blue-200 transition-all">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-700 shadow-sm border border-slate-100 group-hover:bg-blue-700 group-hover:text-white transition-all">
                      <History size={20} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-black text-slate-800 uppercase leading-none">{log.targetName}</p>
                        <span className="text-[9px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-3">Password direset oleh <b>{log.adminName}</b></p>
                      <div className="p-3 bg-white/50 rounded-xl border border-slate-200">
                         <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Alasan:</p>
                         <p className="text-[11px] font-medium text-slate-600 italic">"{log.reason}"</p>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
                   <CheckCircle2 size={64} className="mb-6" />
                   <p className="text-xs font-black uppercase tracking-widest">Belum ada riwayat reset tercatat dalam sesi ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;
