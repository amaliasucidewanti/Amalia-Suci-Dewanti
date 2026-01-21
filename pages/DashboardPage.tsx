
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserMinus, 
  FileText, 
  CheckCircle, 
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck
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
  Cell,
  Legend
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
  const [filter, setFilter] = useState({ 
    month: 'Januari', 
    year: '2026', 
    unit: 'Semua Unit',
    search: ''
  });

  // Filter tugas personal untuk pegawai yang login
  const pendingReports = useMemo(() => {
    if (isAdmin) return [];
    return tasks.filter(t => 
      t.employees.some(e => e.nip === currentUser?.nip) && 
      t.reportStatus === ReportStatus.PENDING
    );
  }, [tasks, currentUser, isAdmin]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchUnit = filter.unit === 'Semua Unit' || emp.unit === filter.unit;
      const matchSearch = emp.name.toLowerCase().includes(filter.search.toLowerCase()) || 
                          emp.nip.includes(filter.search);
      return matchUnit && matchSearch;
    });
  }, [employees, filter.unit, filter.search]);

  const dynamicStats = useMemo(() => {
    const total = filteredEmployees.length;
    if (total === 0) return { assigned: 0, unassigned: 0, activeSurat: 0, avgDiscipline: 0 };
    
    const assigned = filteredEmployees.filter(e => e.status === EmployeeStatus.ASSIGNED).length;
    const unassigned = filteredEmployees.filter(e => e.status === EmployeeStatus.UNASSIGNED).length;
    const avgDiscipline = filteredEmployees.reduce((acc, curr) => acc + curr.disciplineScore.final, 0) / total;
    const activeSurat = isAdmin ? tasks.length : tasks.filter(t => t.employees.some(e => e.nip === currentUser?.nip)).length;
    
    return { assigned, unassigned, activeSurat, avgDiscipline };
  }, [filteredEmployees, tasks, isAdmin, currentUser]);

  const pieData = useMemo(() => {
    const categories = [
      { name: 'Sangat Baik (>90%)', value: 0, fill: '#1d4ed8' }, 
      { name: 'Baik (75-90%)', value: 0, fill: '#3b82f6' },      
      { name: 'Cukup (60-75%)', value: 0, fill: '#f59e0b' },     
      { name: 'Kurang (<60%)', value: 0, fill: '#ef4444' },     
    ];
    filteredEmployees.forEach(emp => {
      const score = emp.disciplineScore.final;
      if (score > 90) categories[0].value++;
      else if (score >= 75) categories[1].value++;
      else if (score >= 60) categories[2].value++;
      else categories[3].value++;
    });
    return categories.filter(c => c.value > 0);
  }, [filteredEmployees]);

  const units = useMemo(() => {
    const uniqueUnits = Array.from(new Set(employees.map(e => e.unit).filter(u => u && u !== '-')));
    return ['Semua Unit', ...uniqueUnits];
  }, [employees]);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-slate-800 tabular-nums">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgColor} ${color} shadow-inner`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-[10px] uppercase tracking-wider font-bold text-slate-400">
        <TrendingUp size={12} className="mr-1 text-blue-500" />
        <span>Data Real-time BPMP</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Banner Tugas untuk Pegawai */}
      {!isAdmin && pendingReports.length > 0 && (
        <div className="bg-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <ClipboardCheck size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight">Pelaporan Tugas Diperlukan</h4>
              <p className="text-blue-100 text-sm mt-1 font-medium">Anda memiliki {pendingReports.length} tugas yang belum dilaporkan. Segera unggah laporan untuk verifikasi kedisiplinan.</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('reports')}
            className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-blue-50 transition-all shadow-lg active:scale-95 shrink-0"
          >
            Lapor Sekarang
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label={isAdmin ? "Pegawai Bertugas" : "Status Saya"} value={isAdmin ? dynamicStats.assigned : "Aktif"} color="text-blue-600" bgColor="bg-blue-50" />
        {isAdmin && <StatCard icon={UserMinus} label="Pegawai Tidak Bertugas" value={dynamicStats.unassigned} color="text-amber-600" bgColor="bg-amber-50" />}
        <StatCard icon={FileText} label={isAdmin ? "Surat Tugas Aktif" : "Total Penugasan"} value={dynamicStats.activeSurat} color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatCard icon={CheckCircle} label="Indeks Disiplin" value={`${dynamicStats.avgDiscipline.toFixed(1)}%`} color="text-emerald-600" bgColor="bg-emerald-50" />
      </div>

      {/* Visualizations & Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-slate-800 font-bold flex items-center gap-3 uppercase tracking-tighter text-lg">
              <TrendingUp className="text-blue-600" size={20} />
              Grafik Tren Penugasan 2026
            </h4>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="bertugas" name="Bertugas" fill="#1d4ed8" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="tidak" name="Tidak Bertugas" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
          <h4 className="text-slate-800 font-bold mb-8 uppercase tracking-tighter text-lg">Komposisi Kedisiplinan</h4>
          <div className="flex-1 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm italic">Data belum tersedia</div>
            )}
          </div>
          <div className="space-y-3 mt-6">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                  <span className="text-slate-500 uppercase">{item.name.split(' (')[0]}</span>
                </div>
                <span className="text-slate-800">{item.value} Pegawai</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
