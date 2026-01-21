
import React, { useState } from 'react';
import { Employee, Page, AssignmentTask } from '../types';
import { ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, Info, Briefcase, X, Plus } from 'lucide-react';

interface CalendarPageProps {
  employees: Employee[];
  tasks: AssignmentTask[];
  onNavigate: (page: Page) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ employees, tasks, onNavigate }) => {
  // Default ke bulan berjalan agar relevan dengan waktu saat ini
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: number, unassigned: Employee[], activeTasks: AssignmentTask[] } | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startDay }, (_, i) => null);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  /**
   * Fungsi helper untuk memproses tanggal dari string YYYY-MM-DD
   */
  const parseDateSafely = (dateStr: string) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  /**
   * Mendapatkan status kegiatan dan ketersediaan pegawai pada tanggal tertentu
   */
  const getStatusForDay = (day: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayTime = dayDate.setHours(0, 0, 0, 0);
    
    const busyNips = new Set<string>();
    const activeTasks: AssignmentTask[] = [];
    
    tasks.forEach(task => {
      const start = parseDateSafely(task.startDate);
      const end = parseDateSafely(task.endDate);
      
      if (start && end) {
        const startTime = start.setHours(0, 0, 0, 0);
        const endTime = end.setHours(0, 0, 0, 0);

        if (dayTime >= startTime && dayTime <= endTime) {
          activeTasks.push(task);
          task.employees.forEach(emp => busyNips.add(emp.nip));
        }
      }
    });

    const unassignedList = employees.filter(emp => !busyNips.has(emp.nip));

    return { 
      unassignedCount: unassignedList.length, 
      unassignedList,
      activeTasks
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">Kalender Pemantauan Tugas</h3>
          <p className="text-slate-500 text-sm font-medium">Informasi ketersediaan pegawai dan kegiatan BPMP Malut</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm p-1">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="px-6 font-black text-slate-800 min-w-[200px] text-center flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
            <CalendarIcon size={16} className="text-blue-600" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
          {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(day => (
            <div key={day} className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {[...padding, ...days].map((day, idx) => {
            const status = day ? getStatusForDay(day) : null;
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={idx} 
                onClick={() => day && setSelectedDayInfo({ day, unassigned: status!.unassignedList, activeTasks: status!.activeTasks })}
                className={`min-h-[140px] p-2 border-r border-b border-slate-50 flex flex-col gap-1 transition-all cursor-pointer group overflow-hidden relative ${
                  day ? 'hover:bg-blue-50/40 bg-white' : 'bg-slate-50/30'
                }`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-black ml-1 mb-2 w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                      isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 group-hover:text-slate-600'
                    }`}>
                      {day}
                    </span>
                    
                    <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                      {status!.activeTasks.map((task, tidx) => (
                        <div key={tidx} className="bg-blue-600 text-white text-[9px] px-2 py-1.5 rounded-lg font-bold leading-tight truncate shadow-sm border border-blue-500" title={task.description}>
                          {task.description}
                        </div>
                      ))}

                      {day && status!.activeTasks.length === 0 && (
                        <div className="bg-slate-50 text-slate-400 text-[9px] p-2 rounded-lg font-bold border border-dashed border-slate-200 text-center">
                          Kosong
                        </div>
                      )}

                      {status!.unassignedCount > 0 ? (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8px] px-2 py-1 rounded-md font-black flex items-center gap-1 uppercase tracking-tighter mt-1">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                          {status!.unassignedCount} Pegawai Standby
                        </div>
                      ) : status!.activeTasks.length > 0 ? (
                        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[8px] px-2 py-1 rounded-md font-black flex items-center gap-1 uppercase tracking-tighter mt-1">
                          <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
                          Semua Bertugas
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-3 h-3 bg-blue-600 rounded-md shadow-sm"></span>
            <span>Kegiatan Aktif</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-3 h-3 bg-emerald-500 rounded-md shadow-sm"></span>
            <span>Tersedia Standby</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-3 h-3 bg-rose-500 rounded-md shadow-sm"></span>
            <span>Semua Bertugas</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 md:ml-auto font-bold uppercase tracking-widest flex items-center gap-2">
          <Info size={14} className="text-blue-500" />
          Data disinkronkan dengan Surat Tugas & Laporan
        </div>
      </div>

      {/* Modal Detail Harian */}
      {selectedDayInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h4 className="font-black text-slate-800 tracking-tight uppercase text-xl">
                  {selectedDayInfo.day} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h4>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1">Detail Operasional Harian</p>
              </div>
              <button onClick={() => setSelectedDayInfo(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 shadow-sm border border-slate-100">
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-8 space-y-10">
              {/* Bagian Kegiatan */}
              <section className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Briefcase size={16} /></div>
                  Kegiatan Berlangsung ({selectedDayInfo.activeTasks.length})
                </h5>
                {selectedDayInfo.activeTasks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {selectedDayInfo.activeTasks.map((task, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-5 rounded-[24px] shadow-sm hover:border-blue-200 transition-colors">
                        <p className="text-[10px] font-mono font-black text-blue-600 mb-2 uppercase tracking-widest">{task.letterNumber}</p>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4">{task.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mb-4 uppercase tracking-tighter">
                          <span className="px-2 py-1 bg-slate-100 rounded-md">{task.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {task.employees.map(e => (
                            <span key={e.nip} className="text-[9px] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-blue-700 font-black uppercase tracking-tighter">
                              {e.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Tidak ada penugasan luar kantor</p>
                  </div>
                )}
              </section>

              {/* Bagian Pegawai Standby */}
              <section className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg"><User size={16} /></div>
                  Pegawai Standby / Tersedia ({selectedDayInfo.unassigned.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDayInfo.unassigned.length > 0 ? selectedDayInfo.unassigned.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-[20px] border border-transparent hover:border-emerald-200 transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-black border border-slate-100 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 text-[11px] truncate leading-tight uppercase tracking-tight">{emp.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono truncate mt-0.5">{emp.nip}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-10 text-center bg-rose-50 rounded-[32px] border border-rose-100">
                      <p className="text-rose-600 font-black text-xs uppercase tracking-widest">Seluruh pegawai sedang bertugas</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => setSelectedDayInfo(null)}
                className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
              >
                Tutup
              </button>
              <button 
                onClick={() => { setSelectedDayInfo(null); onNavigate('unassigned'); }}
                className="flex-[2] bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Buat Penugasan Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
