
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserMinus, 
  FileText, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  ClipboardCheck,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { MOCK_CHART_DATA } from '../data';
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
  const isAdmin = currentUser?.nip === 'Admin';

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
              <div className="mt-2 space-y-1">
                {pendingReports.map(t => (
                  <p key={t.id} className="text-rose-100 text-sm font-medium flex items-center gap-2">
                    <Briefcase size={14} /> Bertugas pada kegiatan: <span className="font-bold underline">{t.description}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('reports')}
            className="bg-white text-rose-600 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:bg-rose-50 transition-all shadow-xl"
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
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
          <h4 className="text-slate-800 font-black mb-10 uppercase tracking-tighter text-xl">Statistik Operasional BPMP</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'}} />
                <Bar dataKey="bertugas" name="Bertugas" fill="#e11d48" radius={[8, 8, 0, 0]} />
                <Bar dataKey="tidak" name="Standby" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                <Tooltip />
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
