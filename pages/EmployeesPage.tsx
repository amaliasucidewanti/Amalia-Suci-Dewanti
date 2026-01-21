
import React, { useState } from 'react';
import { Employee, EmployeeStatus, Page } from '../types';
import { Search, Calendar, Eye, MapPin } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">Data Pegawai BPMP</h3>
          <p className="text-sm text-slate-500">Manajemen profil dan status ketersediaan personil</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari NIP atau Nama..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-[15px] text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm font-bold"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Pegawai / NIP</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jabatan</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Terakhir</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp) => {
                const activeActivity = (emp as any).activeActivity;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 font-black text-xs border border-blue-100 shadow-sm">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-700 text-sm uppercase tracking-tight">{emp.name}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{emp.nip}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] text-slate-600 font-bold uppercase">{emp.position}</td>
                    <td className="px-8 py-6">
                      {activeActivity ? (
                        <div className="flex flex-col gap-1 max-w-xs">
                           <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Nama Kegiatan:</p>
                           <p className="text-[11px] font-bold text-slate-700 leading-tight truncate" title={activeActivity}>{activeActivity}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 italic">Tidak ada kegiatan aktif</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                        emp.status === EmployeeStatus.ASSIGNED 
                          ? 'bg-rose-50 text-rose-700 border-rose-100' // Bertugas = Merah
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100' // Tidak Bertugas = Hijau
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${emp.status === EmployeeStatus.ASSIGNED ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate('discipline')} className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"><Eye size={18} /></button>
                        <button onClick={() => navigate('calendar')} className="p-3 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"><Calendar size={18} /></button>
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
