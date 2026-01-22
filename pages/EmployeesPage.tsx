
import React, { useState } from 'react';
import { Employee, EmployeeStatus, Page } from '../types';
import { Search, Calendar, Eye, Briefcase, MapPin } from 'lucide-react';

interface EmployeesPageProps {
  employees: Employee[];
  navigate: (page: Page) => void;
}

const EmployeesPage: React.FC<EmployeesPageProps> = ({ employees, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.nip.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Database Personil BPMP</h3>
          <p className="text-sm text-slate-500 font-medium">Monitoring status real-time dan ketersediaan pegawai hari ini.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari NIP atau Nama..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] text-xs outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm font-bold transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Pegawai / NIP</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jabatan</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aktivitas Penugasan</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp) => {
                const activeActivity = (emp as any).activeActivity;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-100 rounded-[20px] flex items-center justify-center text-blue-700 font-black text-lg border-2 border-white shadow-sm group-hover:bg-blue-700 group-hover:text-white transition-all">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-blue-700 text-sm uppercase tracking-tight leading-none mb-1.5">{emp.name}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{emp.nip}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-[10px] text-slate-600 font-black uppercase tracking-tight">{emp.position}</td>
                    <td className="px-10 py-8">
                      {activeActivity ? (
                        <div className="flex flex-col gap-2 max-w-xs bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                           <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                             <Briefcase size={12} /> Nama Kegiatan:
                           </p>
                           <p className="text-[11px] font-black text-slate-700 leading-snug" title={activeActivity}>{activeActivity}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-500/50 italic">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                           <span className="text-[10px] font-bold uppercase tracking-widest">Tidak ada kegiatan aktif</span>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border-2 ${
                        emp.status === EmployeeStatus.ASSIGNED 
                          ? 'bg-rose-50 text-rose-700 border-rose-100' // Bertugas = Merah
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100' // Tidak Bertugas = Hijau
                      }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${emp.status === EmployeeStatus.ASSIGNED ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => navigate('discipline')} className="p-4 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all border border-transparent hover:border-blue-100" title="Kedisiplinan"><Eye size={20} /></button>
                        <button onClick={() => navigate('calendar')} className="p-4 hover:bg-slate-50 text-slate-600 rounded-2xl transition-all border border-transparent hover:border-slate-200" title="Kalender"><Calendar size={20} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
