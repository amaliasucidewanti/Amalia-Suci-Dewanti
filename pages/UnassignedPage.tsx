
import React, { useState } from 'react';
import { Employee, EmployeeStatus } from '../types';
import { UserPlus, Search, Info } from 'lucide-react';

interface UnassignedPageProps {
  employees: Employee[];
  onSelectEmployees: (selected: Employee[]) => void;
}

const UnassignedPage: React.FC<UnassignedPageProps> = ({ employees, onSelectEmployees }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const unassigned = employees.filter(e => e.status === EmployeeStatus.UNASSIGNED);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleCreateTask = () => {
    const selected = unassigned.filter(e => selectedIds.has(e.id));
    if (selected.length > 0) {
      onSelectEmployees(selected);
    } else {
      alert("Pilih setidaknya satu pegawai untuk dibuatkan surat tugas.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-700 p-8 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-blue-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Manajemen Penugasan</h3>
            <p className="text-blue-100">Daftar pegawai yang saat ini tidak memiliki tugas aktif. Berikan penugasan untuk memastikan akuntabilitas kerja.</p>
          </div>
          <button 
            onClick={handleCreateTask}
            disabled={selectedIds.size === 0}
            className={`px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
              selectedIds.size > 0 
                ? 'bg-white text-blue-700 hover:bg-blue-50 scale-105 active:scale-95' 
                : 'bg-blue-600 text-blue-300 cursor-not-allowed border border-blue-500'
            }`}
          >
            <UserPlus size={20} />
            BUAT SURAT TUGAS {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
        </div>
        {/* Decor */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
           <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-100">
             <Info size={14} />
             Hanya menampilkan pegawai berstatus "Tidak Bertugas"
           </div>
           <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(unassigned.map(e => e.id)));
                      else setSelectedIds(new Set());
                    }}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Pegawai</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIP / Jabatan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Skor Disiplin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {unassigned.map(emp => (
                <tr 
                  key={emp.id} 
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedIds.has(emp.id) ? 'bg-blue-50/50' : ''}`}
                  onClick={() => toggleSelect(emp.id)}
                >
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(emp.id)}
                      onChange={() => {}} // Handled by tr onClick
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{emp.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono text-slate-500">{emp.nip}</span>
                      <span className="text-xs text-slate-600 font-medium">{emp.position}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${emp.disciplineScore.final > 80 ? 'bg-emerald-500' : emp.disciplineScore.final > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${emp.disciplineScore.final}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 block">{emp.disciplineScore.final.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
              {unassigned.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Semua pegawai sedang bertugas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UnassignedPage;
