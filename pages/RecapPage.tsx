
import React, { useState, useMemo } from 'react';
import { AssignmentTask, Employee, ActivityType } from '../types';
import { Search, Filter, Download, Calendar, Briefcase, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RecapPageProps {
  tasks: AssignmentTask[];
  employees: Employee[];
}

const RecapPage: React.FC<RecapPageProps> = ({ tasks, employees }) => {
  const [filterName, setFilterName] = useState('');
  const [filterUnit, setFilterUnit] = useState('All');
  const [filterType, setFilterType] = useState<'All' | ActivityType>('All');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const units = useMemo(() => {
    const u = new Set(employees.map(e => e.unit));
    return ['All', ...Array.from(u)];
  }, [employees]);

  const filteredRecap = useMemo(() => {
    return tasks.filter(t => {
      const matchName = filterName === '' || t.employees.some(e => e.name.toLowerCase().includes(filterName.toLowerCase()));
      const matchUnit = filterUnit === 'All' || t.employees.some(e => e.unit === filterUnit);
      const matchType = filterType === 'All' || t.activityType === filterType;
      return matchName && matchUnit && matchType;
    }).sort((a, b) => {
      // Sort by start date descending
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [tasks, filterName, filterUnit, filterType]);

  const getTaskStatusBadge = (endDateStr: string) => {
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase border border-slate-200">
          <CheckCircle2 size={10} /> Selesai
        </span>
      );
    } else if (diffDays <= 3) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase border border-amber-200 animate-pulse">
          <Clock size={10} /> Akan Selesai
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-200">
          <AlertCircle size={10} /> Masih Aktif
        </span>
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Rekap Pelaksanaan Tugas</h3>
          <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-widest flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            Data Faktual Real-Time dari Jadwal Tugas
          </p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100">
          <Download size={18} /> Cetak Laporan Rekap
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-3 px-4">
           <Search size={18} className="text-slate-400" />
           <input type="text" placeholder="Cari Nama Pegawai..." value={filterName} onChange={(e) => setFilterName(e.target.value)} className="w-full py-3 bg-transparent text-xs font-bold outline-none" />
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-3 px-4">
           <Filter size={18} className="text-slate-400" />
           <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className="w-full py-3 bg-transparent text-xs font-bold outline-none appearance-none cursor-pointer">
              {units.map(u => <option key={u} value={u}>{u === 'All' ? 'Seluruh Unit Kerja' : u}</option>)}
           </select>
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-3 px-4">
           <Briefcase size={18} className="text-slate-400" />
           <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full py-3 bg-transparent text-xs font-bold outline-none appearance-none cursor-pointer">
              <option value="All">Semua Jenis Penugasan</option>
              <option value="Daring">Dalam Jaringan (Daring)</option>
              <option value="Luring">Tatap Muka (Luring)</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-widest">
                <th className="px-10 py-6">Nama Pegawai / NIP</th>
                <th className="px-10 py-6">Unit Kerja</th>
                <th className="px-10 py-6">Nomor ST & Jenis</th>
                <th className="px-10 py-6">Kegiatan & Tanggal</th>
                <th className="px-10 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecap.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-6">
                    {t.employees.map(emp => (
                      <div key={emp.nip} className="flex items-center gap-3 mb-2 last:mb-0">
                         <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700 font-black text-[10px] border border-blue-100 uppercase">
                            {emp.name.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-slate-800 text-xs uppercase">{emp.name}</p>
                            <p className="text-[9px] font-mono text-slate-400">{emp.nip}</p>
                         </div>
                      </div>
                    ))}
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black uppercase text-slate-500">{t.employees[0]?.unit || '-'}</span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-[10px] font-mono font-bold text-blue-700 mb-1 leading-none">{t.letterNumber}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${t.activityType === 'Luring' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                       {t.activityType}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs font-bold text-slate-700 leading-snug mb-1">{t.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {new Date(t.startDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})} s.d {new Date(t.endDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                    </p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center">
                      {getTaskStatusBadge(t.endDate)}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecap.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center opacity-30 italic text-slate-500 font-black uppercase tracking-widest">
                    Tidak ditemukan data penugasan aktif
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecapPage;
