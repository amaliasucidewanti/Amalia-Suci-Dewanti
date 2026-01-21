
import React, { useState } from 'react';
import { Employee } from '../types';
import { Award, Info, Search, ChevronRight } from 'lucide-react';

interface DisciplinePageProps {
  employees: Employee[];
}

const DisciplinePage: React.FC<DisciplinePageProps> = ({ employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const ProgressBar = ({ value, label, weight, color }: { value: number, label: string, weight: string, color: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label} <span className="text-slate-400">({weight})</span></span>
        <span className={`text-sm font-bold ${color}`}>{value}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${color.replace('text', 'bg')}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Indeks Kedisiplinan Pegawai</h3>
          <p className="text-slate-500 text-sm">Pemantauan Akuntabilitas Berdasarkan Kinerja Harian</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            <span className="text-xs font-bold text-slate-600">Sangat Baik (&gt;90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            <span className="text-xs font-bold text-slate-600">Baik (75-90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
            <span className="text-xs font-bold text-slate-600">Perlu Perbaikan (&lt;75%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
             <Search size={18} className="text-slate-400" />
             <input type="text" placeholder="Cari Pegawai..." className="bg-transparent text-sm outline-none flex-1" />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="px-6 py-3">Nama Pegawai</th>
                  <th className="px-6 py-3 text-center">Skor Akhir</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map(emp => (
                  <tr 
                    key={emp.id} 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedEmployee?.id === emp.id ? 'bg-blue-50/50' : ''}`}
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 text-sm">{emp.name}</p>
                      <p className="text-[10px] text-slate-500">{emp.position}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-black ${
                        emp.disciplineScore.final > 90 ? 'text-emerald-600' : 
                        emp.disciplineScore.final > 75 ? 'text-blue-600' : 'text-rose-600'
                      }`}>
                        {emp.disciplineScore.final.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={18} className="text-slate-300 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {selectedEmployee ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 border-2 border-white shadow-md">
                   <Award size={40} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{selectedEmployee.name}</h4>
                  <p className="text-sm text-slate-500 font-mono">{selectedEmployee.nip}</p>
                  <p className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded inline-block mt-2">
                    {selectedEmployee.unit}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Skor Akumulasi</p>
                    <h5 className="text-3xl font-black text-slate-800">{selectedEmployee.disciplineScore.final.toFixed(1)}%</h5>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center flex flex-col justify-center">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Status Kinerja</p>
                    <span className={`text-sm font-bold uppercase tracking-widest ${
                      selectedEmployee.disciplineScore.final > 85 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {selectedEmployee.disciplineScore.final > 85 ? 'Sangat Baik' : 'Baik'}
                    </span>
                 </div>
              </div>

              <div className="space-y-6">
                <ProgressBar value={selectedEmployee.disciplineScore.attendance} label="Kehadiran" weight="25%" color="text-emerald-600" />
                <ProgressBar value={selectedEmployee.disciplineScore.assembly} label="Apel Pagi" weight="15%" color="text-blue-600" />
                <ProgressBar value={selectedEmployee.disciplineScore.dailyLog} label="Log Harian" weight="20%" color="text-indigo-600" />
                <ProgressBar value={selectedEmployee.disciplineScore.report} label="Pelaporan Tugas" weight="40%" color="text-purple-600" />
              </div>

              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                 <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-xs text-blue-800 leading-relaxed italic">
                   "Data ini dihitung secara otomatis berdasarkan sinkronisasi dengan Google Spreadsheet Presensi dan E-Log Harian. Pastikan seluruh berkas pelaporan tugas telah diverifikasi oleh atasan langsung."
                 </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
               <Award size={64} className="text-slate-300" />
               <div>
                  <h4 className="font-bold text-slate-800">Detail Belum Terpilih</h4>
                  <p className="text-sm text-slate-500">Klik salah satu nama pegawai untuk melihat rincian komponen kedisiplinan</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisciplinePage;
