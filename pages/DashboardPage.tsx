
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserMinus, 
  FileText, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  ClipboardCheck,
  Briefcase,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell,
  Tooltip,
  ResponsiveContainer 
} from 'recharts';
import { Employee, EmployeeStatus, AssignmentTask, ReportStatus } from '../types';

interface DashboardPageProps {
  stats: {
    assigned: number;
    unassigned: number;
    activeSurat: number;
    avgDiscipline: number;
  };
  employees: Employee[];
  tasks?: AssignmentTask[];
  currentUser?: any;
  onNavigate?: (page: any) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ employees, tasks = [], currentUser, onNavigate }) => {
  const isAdmin = currentUser?.nip === 'Admin' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN_TIM';

  const pendingReports = useMemo(() => {
    if (isAdmin) return [];
    return tasks.filter(t => 
      t.employees.some(e => e.nip === currentUser?.nip) && 
      t.reportStatus === ReportStatus.PENDING
    );
  }, [tasks, currentUser, isAdmin]);

  const dynamicStats = useMemo(() => {
    const total = employees.length;
    if (total === 0) return { assigned: 0, unassigned: 0, activeSurat: 0, avgDiscipline: 0 };
    
    const assigned = employees.filter(e => e.status === EmployeeStatus.ASSIGNED).length;
    const unassigned = employees.filter(e => e.status === EmployeeStatus.UNASSIGNED).length;
    const avgDiscipline = employees.reduce((acc, curr) => acc + (curr.disciplineScore?.final || 0), 0) / total;
    
    const activeSurat = isAdmin 
      ? tasks.length 
      : tasks.filter(t => t.employees.some(e => e.nip === currentUser?.nip)).length;
    
    return { assigned, unassigned, activeSurat, avgDiscipline };
  }, [employees, tasks, isAdmin, currentUser]);

  const recentTasks = useMemo(() => {
    // Ambil 5 penugasan terbaru berdasarkan urutan data
    return [...tasks].reverse().slice(0, 5);
  }, [tasks]);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }: any) => (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
          <h3 className="text-4xl font-black text-slate-800 tabular-nums tracking-tighter">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${bgColor} ${color} shadow-sm border border-current/10`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {!isAdmin && pendingReports.length > 0 && (
        <div className="bg-rose-600 rounded-[40px] p-10 text-white shadow-2xl shadow-rose-200 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/30">
              <ClipboardCheck size={40} />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-black uppercase tracking-tighter">Laporan Tugas Perlu Diisi</h4>
              <div className="mt-2 space-y-2">
                {pendingReports.map(t => (
                  <div key={t.id} className="bg-white/10 p-4 rounded-2xl border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 mb-1">Nama Kegiatan:</p>
                    <p className="text-sm font-bold text-white leading-snug">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('reports')}
            className="bg-white text-rose-600 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:bg-rose-50 transition-all shadow-xl shrink-0"
          >
            Lapor Sekarang
            <ArrowRight size={20} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={Users} label="Pegawai Bertugas" value={dynamicStats.assigned} color="text-rose-600" bgColor="bg-rose-50" />
        <StatCard icon={UserMinus} label="Pegawai Standby" value={dynamicStats.unassigned} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard icon={FileText} label="Surat Tugas Aktif" value={dynamicStats.activeSurat} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={CheckCircle} label="Indeks Disiplin" value={`${dynamicStats.avgDiscipline.toFixed(1)}%`} color="text-indigo-600" bgColor="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-slate-800 font-black uppercase tracking-tighter text-xl leading-none">Rekap Penugasan Terbaru</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Monitoring surat tugas yang baru terbit</p>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('reports')}
              className="p-3 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-blue-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              Lihat Semua <ExternalLink size={14} />
            </button>
          </div>
          
          <div className="overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                    <th className="pb-4 pr-4">Nomor ST</th>
                    <th className="pb-4 pr-4">Kegiatan</th>
                    <th className="pb-4 pr-4">Pelaksana</th>
                    <th className="pb-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTasks.map((t, idx) => (
                    <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pr-4">
                        <p className="text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 w-fit">{t.letterNumber}</p>
                      </td>
                      <td className="py-5 pr-4">
                        <p className="text-xs font-bold text-slate-700 line-clamp-1 leading-snug">{t.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar size={10} className="text-slate-400" />
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{t.startDate} - {t.endDate}</p>
                        </div>
                      </td>
                      <td className="py-5 pr-4">
                        <div className="flex -space-x-2">
                          {t.employees.slice(0, 3).map((emp, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black uppercase text-slate-600" title={emp.name}>
                              {emp.name.charAt(0)}
                            </div>
                          ))}
                          {t.employees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                              +{t.employees.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 text-right">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full border ${
                          t.reportStatus === ReportStatus.SUBMITTED 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {t.reportStatus === ReportStatus.SUBMITTED ? 'Selesai' : 'Proses'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentTasks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400 text-xs italic">Belum ada data penugasan yang tercatat.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col items-center">
          <h4 className="text-slate-800 font-black mb-10 uppercase tracking-tighter text-xl self-start">Ketersediaan SDM</h4>
          <div className="relative w-full aspect-square max-w-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Bertugas', value: dynamicStats.assigned },
                    { name: 'Standby', value: dynamicStats.unassigned }
                  ]}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={10}
                  dataKey="value"
                >
                   <Cell key="assigned" fill="#e11d48" />
                   <Cell key="unassigned" fill="#10b981" />
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full space-y-4 mt-10">
             <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Bertugas pada kegiatan</span>
                <span className="text-sm font-black text-rose-700">{dynamicStats.assigned}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Siap bertugas (Standby)</span>
                <span className="text-sm font-black text-emerald-700">{dynamicStats.unassigned}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
