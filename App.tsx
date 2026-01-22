
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
  Bell,
  User as UserIcon,
  ShieldAlert,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { Page, Employee, EmployeeStatus, AssignmentTask, ReportStatus, UserRole, AccountStatus } from './types';
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
import ResetPasswordPage from './pages/ResetPasswordPage';
import RecapPage from './pages/RecapPage';

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
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSpreadsheetData();
      const empsWithStatus = data.employees.map(e => ({
        ...e,
        accountStatus: e.accountStatus || AccountStatus.ACTIVE
      }));
      setEmployees(empsWithStatus);
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
  }, []);

  const handleUpdateTask = async (updatedTask: AssignmentTask) => {
    setIsLoading(true);
    if (typeof google !== 'undefined' && google.script) {
      google.script.run
        .withSuccessHandler(() => {
          refreshData();
          showToast("Data Berhasil Diperbarui");
        })
        .withFailureHandler(() => {
          setIsLoading(false);
          showToast("Gagal memperbarui data", "error");
        })
        .saveReportRecord({
          ...updatedTask,
          nip: currentUser.nip
        });
    } else {
      setTimeout(() => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setIsLoading(false);
        showToast("Mode Demo: Data diperbarui");
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
        setCurrentPage('dashboard');
        setIsLoading(false);
        showToast("Mode Demo: Surat Tugas disimpan");
      }, 800);
    }
  };

  const handleLogin = (username: string, password: string, isNewPassword = false) => {
    const adminUsernames = ['Admin', 'timkerpaud', 'timkersd', 'timkersmp', 'timkersma', 'subbagumum'];
    
    if (username === 'Admin') {
      if (password === '12345' && !isNewPassword) {
        return { success: true, mustChange: true };
      }
      setCurrentUser({ name: 'Super Administrator', nip: 'Admin', unit: 'BPMP Maluku Utara', role: UserRole.SUPER_ADMIN });
      setCurrentPage('dashboard');
      showToast(isNewPassword ? "Password diperbarui!" : "Selamat Datang, Super Admin");
      return { success: true };
    }
    
    if (adminUsernames.includes(username)) {
      if (password === '12345' && !isNewPassword) {
        return { success: true, mustChange: true };
      }
      const unitMap: any = {
        'timkerpaud': 'Tim Kerja PAUD',
        'timkersd': 'Tim Kerja SD',
        'timkersmp': 'Tim Kerja SMP',
        'timkersma': 'Tim Kerja SMA',
        'subbagumum': 'Subbagian Umum'
      };
      setCurrentUser({ name: `Admin ${unitMap[username] || 'Tim Kerja'}`, nip: username, unit: unitMap[username] || 'Tim Kerja', role: UserRole.ADMIN_TIM });
      setCurrentPage('dashboard');
      showToast("Selamat Datang, Admin Tim");
      return { success: true };
    }

    const user = employees.find(emp => emp.nip === username);
    if (user) {
      if (password === '12345' && !isNewPassword) {
        return { success: true, mustChange: true };
      }
      setCurrentUser({ ...user, role: UserRole.PEGAWAI });
      setCurrentPage('dashboard');
      showToast(isNewPassword ? "Password diperbarui!" : `Selamat Datang, ${user.name}`);
      return { success: true };
    }
    return { success: false, message: 'NIP atau Username tidak ditemukan.' };
  };

  const stats = useMemo(() => {
    const assigned = employees.filter(e => e.status === EmployeeStatus.ASSIGNED).length;
    const unassigned = employees.filter(e => e.status === EmployeeStatus.UNASSIGNED).length;
    const avg = employees.length ? employees.reduce((acc, curr) => acc + (curr.disciplineScore?.final || 0), 0) / employees.length : 0;
    return { assigned, unassigned, activeSurat: tasks.length, avgDiscipline: avg };
  }, [employees, tasks]);

  if (currentPage === 'login') return <LoginPage onLogin={handleLogin} isLoadingData={isLoading} />;

  const isAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdminTim = currentUser?.role === UserRole.ADMIN_TIM;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_TIM, UserRole.PEGAWAI] },
    { id: 'employees', label: 'Data Pegawai', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_TIM] },
    { id: 'calendar', label: 'Kalender Tugas', icon: CalendarIcon, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_TIM, UserRole.PEGAWAI] },
    { id: 'unassigned', label: 'Buat Penugasan', icon: UserX, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_TIM] },
    { id: 'discipline', label: 'Kedisiplinan', icon: CheckCircle, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_TIM, UserRole.PEGAWAI] },
    { id: 'reports', label: 'Laporan Tugas', icon: BarChart3, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_TIM, UserRole.PEGAWAI] },
    { id: 'recap', label: 'Rekap Global', icon: FileSpreadsheet, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_TIM, UserRole.PEGAWAI] },
    { id: 'reset-password', label: 'Reset Password', icon: KeyRound, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_TIM] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {toast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-[24px] shadow-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 font-black text-[10px] uppercase tracking-[0.2em] ${
          toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
        }`}>
          <Bell size={18} />
          {toast.message}
        </div>
      )}

      <aside className={`${isSidebarOpen ? 'w-80' : 'w-28'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-2xl relative`}>
        <div className="p-10 flex items-center gap-6 border-b border-slate-50 bg-slate-50/50">
          <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-contain shrink-0 drop-shadow-md" />
          <div className={`${!isSidebarOpen ? 'hidden' : 'block'} overflow-hidden whitespace-nowrap`}>
            <h1 className="text-2xl font-black text-slate-800 leading-none tracking-tighter uppercase">SI-KERTAS</h1>
            <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.3em] mt-1.5">BPMP MALUT</p>
          </div>
        </div>

        <nav className="flex-1 p-8 space-y-3 overflow-y-auto">
          {sidebarItems.map(item => {
            if (!item.roles.includes(currentUser?.role)) return null;
            return (
              <button 
                key={item.id} 
                onClick={() => setCurrentPage(item.id as Page)} 
                className={`w-full flex items-center gap-5 px-5 py-5 text-[10px] font-black transition-all rounded-[20px] group ${
                  currentPage === item.id ? 'bg-blue-700 text-white shadow-2xl shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <item.icon size={22} className="shrink-0" /> 
                <span className={`${!isSidebarOpen ? 'hidden' : 'block'} uppercase tracking-[0.2em] truncate`}>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-8 border-t border-slate-50">
          <button onClick={() => { setCurrentPage('login'); setCurrentUser(null); }} className="w-full flex items-center gap-5 px-5 py-5 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-[20px] transition-all uppercase tracking-[0.2em]">
            <LogOut size={22} className="shrink-0" /> 
            <span className={!isSidebarOpen ? 'hidden' : 'block'}>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-28 bg-white border-b border-slate-100 flex items-center justify-between px-16 z-10 shrink-0">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 border border-slate-100 transition-colors shadow-sm">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden sm:block">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">{currentPage.replace('-', ' ')}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">BPMP Maluku Utara - Akses Internal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
             {isLoading && <Loader2 size={24} className="animate-spin text-blue-600" />}
             <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-6 group hover:bg-slate-50 p-2 rounded-3xl transition-all">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-700 transition-colors">{currentUser?.name}</p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black text-white ${
                        isAdmin ? 'bg-rose-600' : isAdminTim ? 'bg-amber-600' : 'bg-blue-600'
                      }`}>
                        {currentUser?.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-blue-700 rounded-[24px] border-4 border-white shadow-2xl flex items-center justify-center text-white font-black text-2xl shrink-0 uppercase transition-transform group-hover:scale-105">
                     {currentUser?.name?.charAt(0) || 'A'}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-[32px] shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-50 mb-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Kerja</p>
                       <p className="text-xs font-bold text-slate-800 mt-1">{currentUser?.unit}</p>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-4 text-[10px] font-black text-slate-600 hover:bg-slate-50 rounded-2xl uppercase tracking-widest transition-all">
                      <UserIcon size={18} /> Profil Pribadi
                    </button>
                    <button onClick={() => showToast("Fitur Ubah Password tersedia di halaman login", "success")} className="w-full flex items-center gap-3 px-4 py-4 text-[10px] font-black text-slate-600 hover:bg-slate-50 rounded-2xl uppercase tracking-widest transition-all">
                      <ShieldAlert size={18} /> Ganti Password
                    </button>
                  </div>
                )}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-16 bg-slate-50/50 relative">
          <div className="max-w-7xl mx-auto pb-20">
            {currentPage === 'dashboard' && <DashboardPage stats={stats} employees={employees} tasks={tasks} currentUser={currentUser} onNavigate={setCurrentPage} />}
            {currentPage === 'employees' && <EmployeesPage employees={employees} navigate={setCurrentPage} />}
            {currentPage === 'calendar' && <CalendarPage employees={employees} tasks={tasks} onNavigate={setCurrentPage} />}
            {currentPage === 'unassigned' && <UnassignedPage employees={employees} onSelectEmployees={(s) => { setSelectedForTask(s); setCurrentPage('form'); }} />}
            {currentPage === 'form' && <FormPage tasks={tasks} selectedEmployees={selectedForTask} onPreview={(t) => { setActiveTask(t); setCurrentPage('preview'); }} onCancel={() => setCurrentPage('unassigned')} />}
            {currentPage === 'preview' && activeTask && <PreviewPage task={activeTask} onBack={() => setCurrentPage('form')} onSave={handleSaveAssignment} />}
            {currentPage === 'discipline' && <DisciplinePage employees={employees} />}
            {currentPage === 'reports' && <ReportsPage tasks={tasks} currentUser={currentUser} onUpdateTask={handleUpdateTask} />}
            {currentPage === 'recap' && <RecapPage tasks={tasks} employees={employees} />}
            {currentPage === 'reset-password' && <ResetPasswordPage employees={employees} currentUser={currentUser} onUpdateEmployee={(update) => {
              const target = employees.find(emp => emp.nip === update.nip);
              setEmployees(prev => prev.map(emp => emp.nip === update.nip ? { ...emp, ...update } : emp));
              if (update.accountStatus === AccountStatus.MUST_CHANGE) {
                showToast(`Password ${target?.name || update.nip} berhasil direset`, "success");
              } else {
                showToast(`Status akun ${target?.name || update.nip} diperbarui`, "success");
              }
            }} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
