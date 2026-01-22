
import React, { useState, useMemo } from 'react';
import { AssignmentTask, Employee, ActivityType } from '../types';
import { Search, Filter, Download, Calendar, Briefcase, User } from 'lucide-react';

interface RecapPageProps {
  tasks: AssignmentTask[];
  employees: Employee[];
}

const RecapPage: React.FC<RecapPageProps> = ({ tasks, employees }) => {
  const [filterName, setFilterName] = useState('');
  const [filterUnit, setFilterUnit] = useState('All');
  const [filterType, setFilterType] = useState<'All' | ActivityType>('All');
  const [period, setPeriod] = useState('2026');

  const units = useMemo(() => {
    const u = new Set(employees.map(e => e.unit));
    return ['All', ...Array.from(u)];
  }, [employees]);

  const filteredRecap = useMemo(() => {
    return tasks.filter(t => {
      const matchName = filterName === '' || t.employees.some(e => e.name.toLowerCase().includes(filterName.toLowerCase()));
      const matchUnit = filterUnit === 'All' || t.employees.some(e => e.unit === filterUnit);
      const matchType = filterType === 'All' || t.activityType === filterType;
      const matchPeriod = t.startDate.includes(period);
      return matchName && matchUnit && matchType && matchPeriod;
    });
  }, [tasks, filterName, filterUnit, filterType, period]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Rekapitulasi Global Penugasan</h3>
          <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-widest flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            Monitoring Beban Kerja Pegawai BPMP Malut
          </p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100">
          <Download size={18} /> Ekspor Data Rekap
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-3 px-4">
           <Search size={18} className="text-slate-400" />
           <input type="text" placeholder="Filter Nama..." value={filterName} onChange={(e) => setFilterName(e.target.value)} className="w-full py-3 bg-transparent text-xs font-bold outline-none" />
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-3 px-4">
           <Filter size={18} className="text-slate-400" />
           <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className="w-full py-3 bg-transparent text-xs font-bold outline-none appearance-none cursor-pointer">
              {units.map(u => <option key={u} value={u}>{u === 'All' ? 'Seluruh Unit' : u}</option>)}
           </select>
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-3 px-4">
           <Briefcase size={18} className="text-slate-400" />
           <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full py-3 bg-transparent text-xs font-bold outline-none appearance-none cursor-pointer">
              <option value="All">Semua Jenis</option>
              <option value="Daring">Daring</option>
              <option value="Luring">Luring (Luring)</option>
           </select>
        </div>
        <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-3 px-4">
           <Calendar size={18} className="text-slate-400" />
           <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full py-3 bg-transparent text-xs font-bold outline-none appearance-none cursor-pointer">
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
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
                <th className="px-10 py-6">Pembiayaan</th>
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
                    <p className="text-[10px] font-mono font-bold text-blue-700 mb-1">{t.letterNumber}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${t.activityType === 'Luring' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                       {t.activityType}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs font-bold text-slate-700 leading-snug mb-1">{t.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{t.startDate} s.d {t.endDate}</p>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                       {t.fundingType}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRecap.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center opacity-30 italic text-slate-500">
                    Tidak ditemukan data penugasan pada filter ini.
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
