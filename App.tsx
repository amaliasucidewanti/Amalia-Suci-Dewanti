
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar as CalendarIcon, 
  UserX, 
  CheckCircle, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Loader2,
  Bell
} from 'lucide-react';
import { Page, Employee, EmployeeStatus, AssignmentTask, ReportStatus } from './types';
import { fetchSpreadsheetData } from './data';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import CalendarPage from './pages/CalendarPage';
import UnassignedPage from './pages/UnassignedPage';
import FormPage from './pages/FormPage';
import PreviewPage from './pages/PreviewPage';
import DisciplinePage from './pages/DisciplinePage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';

declare const google: any;

export const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg/512px-Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg.png";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<AssignmentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForTask, setSelectedForTask] = useState<Employee[]>([]);
  const [activeTask, setActiveTask] = useState<AssignmentTask | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSpreadsheetData();
      setEmployees(data.employees);
      setTasks(data.tasks);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      showToast("Gagal menyinkronkan data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZoneName: 'short' 
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateTask = async (updatedTask: AssignmentTask) => {
    setIsLoading(true);
    if (typeof google !== 'undefined' && google.script) {
      if (updatedTask.reportStatus === ReportStatus.PENDING) {
        const targetNip = updatedTask.reportCreatorNip || currentUser.nip;
        google.script.run
          .withSuccessHandler(() => {
            refreshData();
            showToast("Laporan berhasil dihapus");
          })
          .withFailureHandler(() => showToast("Gagal menghapus laporan", "error"))
          .deleteReportRecord(updatedTask.letterNumber, targetNip);
      } else {
        google.script.run
          .withSuccessHandler(() => {
            refreshData();
            showToast("Laporan berhasil disimpan");
          })
          .withFailureHandler(() => showToast("Gagal menyimpan laporan", "error"))
          .saveReportRecord({
            letterNumber: updatedTask.letterNumber,
            summary: updatedTask.reportSummary,
            reportDate: updatedTask.reportDate,
            nip: currentUser.nip,
            documentationPhotos: updatedTask.documentationPhotos
          });
      }
    } else {
      // Mock for development
      setTimeout(() => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setIsLoading(false);
        showToast("Mode Demo: Data diperbarui secara lokal");
      }, 800);
    }
  };

  const handleSaveAssignment = async () => {
    if (!activeTask) return;
    setIsLoading(true);
    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(() => {
          refreshData();
          setCurrentPage('dashboard');
          showToast("Surat Tugas Berhasil Diterbitkan");
        })
        .withFailureHandler(() => {
          setIsLoading(false);
          showToast("Gagal menerbitkan surat tugas", "error");
        })
        .saveAssignmentRecord(activeTask);
    } else {
      setTimeout(() => {
        setTasks(prev => [...prev, activeTask]);
        setEmployees(prev => prev.map(e => 
          activeTask.employees.find(ae => ae.nip === e.nip) ? {...e, status: EmployeeStatus.ASSIGNED} : e
        ));
        setCurrentPage('dashboard');
        setIsLoading(false);
        showToast("Mode Demo: Surat Tugas disimpan");
      }, 800);
    }
  };

  const handleLogin = (username: string, password: string) => {
    if (password !== '12345') return { success: false, message: 'Password salah' };
    
    if (username === 'Admin') {
      const admin = { name: 'Administrator', nip: 'Admin', unit: 'BPMP Malut' };
      setCurrentUser(admin);
      setCurrentPage('dashboard');
      showToast("Selamat Datang, Admin");
      return { success: true };
    }
    
    const user = employees.find(emp => emp.nip === username);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
      showToast(`Selamat Datang, ${user.name}`);
      return { success: true };
    }
    return { success: false, message: 'NIP tidak ditemukan.' };
  };

  const stats = useMemo(() => {
    const assigned = employees.filter(e => e.status === EmployeeStatus.ASSIGNED).length;
    const unassigned = employees.filter(e => e.status === EmployeeStatus.UNASSIGNED).length;
    const avg = employees.length 
      ? employees.reduce((a, c) => a + (c.disciplineScore?.final || 0), 0) / employees.length 
      : 0;
    return { assigned, unassigned, activeSurat: tasks.length, avgDiscipline: avg };
  }, [employees, tasks]);

  if (currentPage === 'login') return <LoginPage onLogin={handleLogin} isLoadingData={isLoading} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 font-bold text-xs uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
        }`}>
          <Bell size={16} />
          {toast.message}
        </div>
      )}

      <aside className={`${isSidebarOpen ? 'w-64' : 'w-24'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-2xl`}>
        <div className="p-8 flex items-center gap-4 border-b border-slate-50 bg-slate-50/30">
          <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain shrink-0 drop-shadow-sm" />
          <div className={`${!isSidebarOpen ? 'hidden' : 'block'} overflow-hidden whitespace-nowrap`}>
            <h1 className="text-lg font-black text-slate-800 leading-none tracking-tighter uppercase">SI-KERTAS</h1>
            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-1">BPMP MALUT</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'employees', label: 'Data Pegawai', icon: Users },
            { id: 'calendar', label: 'Kalender Tugas', icon: CalendarIcon },
            { id: 'unassigned', label: 'Operasional', icon: UserX, adminOnly: true },
            { id: 'discipline', label: 'Kedisiplinan', icon: CheckCircle },
            { id: 'reports', label: 'Laporan Tugas', icon: BarChart3 },
          ].map(item => {
            if (item.adminOnly && currentUser?.nip !== 'Admin') return null;
            return (
              <button 
                key={item.id} 
                onClick={() => setCurrentPage(item.id as Page)} 
                className={`w-full flex items-center gap-4 px-4 py-4 text-xs font-black transition-all rounded-2xl ${
                  currentPage === item.id ? 'bg-blue-700 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <item.icon size={20} className="shrink-0" /> 
                <span className={`${!isSidebarOpen ? 'hidden' : 'block'} uppercase tracking-widest truncate`}>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button onClick={() => { setCurrentPage('login'); setCurrentUser(null); }} className="w-full flex items-center gap-4 px-4 py-4 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-2xl transition-all uppercase tracking-widest">
            <LogOut size={20} className="shrink-0" /> 
            <span className={!isSidebarOpen ? 'hidden' : 'block'}>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-12 z-10 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 border border-slate-100 transition-colors">
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">{currentPage}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Sistem Kerja Tuntas Pegawai</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
             {isLoading && <Loader2 size={20} className="animate-spin text-blue-600" />}
             <div className="text-right hidden md:block">
               <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{currentUser?.name}</p>
               <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{currentTime}</p>
             </div>
             <div className="w-14 h-14 bg-slate-50 rounded-2xl border-2 border-white shadow-xl flex items-center justify-center text-blue-700 font-black text-xl shrink-0 uppercase">
                {currentUser?.name?.charAt(0) || 'A'}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && <DashboardPage stats={stats} employees={employees} tasks={tasks} currentUser={currentUser} onNavigate={setCurrentPage} />}
            {currentPage === 'employees' && <EmployeesPage employees={employees} navigate={setCurrentPage} />}
            {currentPage === 'calendar' && <CalendarPage employees={employees} tasks={tasks} onNavigate={setCurrentPage} />}
            {currentPage === 'unassigned' && <UnassignedPage employees={employees} onSelectEmployees={(s) => { setSelectedForTask(s); setCurrentPage('form'); }} />}
            {currentPage === 'form' && <FormPage selectedEmployees={selectedForTask} onPreview={(t) => { setActiveTask(t); setCurrentPage('preview'); }} onCancel={() => setCurrentPage('unassigned')} />}
            {currentPage === 'preview' && activeTask && <PreviewPage task={activeTask} onBack={() => setCurrentPage('form')} onSave={handleSaveAssignment} />}
            {currentPage === 'discipline' && <DisciplinePage employees={employees} />}
            {currentPage === 'reports' && <ReportsPage tasks={tasks} currentUser={currentUser} onUpdateTask={handleUpdateTask} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
