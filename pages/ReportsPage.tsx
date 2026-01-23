
import React, { useState, useMemo, useRef } from 'react';
import { ReportStatus, AssignmentTask, ReportDetails, UserRole } from '../types';
import { 
  Upload, 
  Eye, 
  Loader2, 
  Search,
  X,
  BookOpen,
  Camera,
  Pencil,
  Trash2,
  Calendar,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { LOGO_URL } from '../App';

interface ReportsPageProps {
  tasks: AssignmentTask[];
  currentUser: any;
  onUpdateTask: (task: AssignmentTask) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ tasks, currentUser, onUpdateTask }) => {
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdminTim = currentUser?.role === UserRole.ADMIN_TIM;
  const isAdmin = isSuperAdmin || isAdminTim;

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>(isAdmin ? 'all' : 'pending');
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadModal, setUploadModal] = useState<AssignmentTask | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState<AssignmentTask | null>(null);
  
  const [uraian, setUraian] = useState('');
  const [hasil, setHasil] = useState('');
  const [kendala, setKendala] = useState('');
  const [solusi, setSolusi] = useState('');
  const [tempPhotos, setTempPhotos] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTasks = useMemo(() => {
    let result = isAdmin 
      ? tasks 
      : tasks.filter(t => t.employees.some(e => e.nip === currentUser?.nip));

    if (activeTab === 'pending') {
      result = result.filter(t => t.reportStatus === ReportStatus.PENDING);
    } else if (activeTab === 'completed') {
      result = result.filter(t => t.reportStatus === ReportStatus.SUBMITTED);
    }

    if (searchQuery) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.letterNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [tasks, currentUser, isAdmin, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const userTasks = isAdmin ? tasks : tasks.filter(t => t.employees.some(e => e.nip === currentUser?.nip));
    return {
      total: userTasks.length,
      pending: userTasks.filter(t => t.reportStatus === ReportStatus.PENDING).length,
      completed: userTasks.filter(t => t.reportStatus === ReportStatus.SUBMITTED).length
    };
  }, [tasks, currentUser, isAdmin]);

  const handleOpenUpload = (task: AssignmentTask, edit: boolean = false) => {
    setUploadModal(task);
    setIsEditMode(edit);
    if (edit && task.reportDetails) {
      setUraian(task.reportDetails.uraian || '');
      setHasil(task.reportDetails.hasil || '');
      setKendala(task.reportDetails.kendala || '');
      setSolusi(task.reportDetails.solusi || '');
      setTempPhotos(task.documentationPhotos || []);
    } else {
      setUraian('');
      setHasil('');
      setKendala('');
      setSolusi('');
      setTempPhotos([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setTempPhotos(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => setTempPhotos(prev => prev.filter((_, i) => i !== index));

  const handleUploadReport = () => {
    if (!uploadModal || !uraian.trim() || !hasil.trim()) {
      alert("Mohon lengkapi Uraian Pelaksanaan dan Hasil yang Dicapai.");
      return;
    }
    if (tempPhotos.length < 3) {
      alert("Wajib mengunggah minimal 3 foto dokumentasi kegiatan.");
      return;
    }
    setIsSyncing(true);
    const details: ReportDetails = { uraian, hasil, kendala: kendala.trim() || undefined, solusi: solusi.trim() || undefined };
    setTimeout(() => {
      onUpdateTask({
        ...uploadModal,
        reportStatus: ReportStatus.SUBMITTED,
        reportDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        reportSummary: JSON.stringify(details),
        reportDetails: details,
        documentationPhotos: tempPhotos
      });
      setUploadModal(null);
      setIsSyncing(false);
      alert(isEditMode ? "LAPORAN BERHASIL DIPERBARUI!" : "LAPORAN BERHASIL DISIMPAN!");
    }, 1000);
  };

  const handleDeleteReport = (task: AssignmentTask) => {
    if (window.confirm("Apakah Anda yakin ingin MENGHAPUS laporan ini?")) {
      setIsSyncing(true);
      setTimeout(() => {
        onUpdateTask({
          ...task,
          reportStatus: ReportStatus.PENDING,
          reportDate: undefined,
          reportSummary: undefined,
          reportDetails: undefined,
          documentationPhotos: []
        });
        setIsSyncing(false);
      }, 800);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100">
            <BookOpen size={32} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Manajemen Laporan</h3>
            <p className="text-slate-500 text-sm mt-3 font-bold uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-blue-600" /> Real-Time Sinkronisasi Spreadsheet
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <div className="text-center px-6">
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Belum Lapor</p>
            <p className="text-2xl font-black text-slate-800">{stats.pending}</p>
          </div>
          <div className="w-px h-10 bg-slate-200"></div>
          <div className="text-center px-6">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Sudah Lapor</p>
            <p className="text-2xl font-black text-slate-800">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('pending')} className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}>Belum Lapor</button>
          <button onClick={() => setActiveTab('completed')} className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>Selesai</button>
          <button onClick={() => setActiveTab('all')} className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400'}`}>Semua</button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Cari Surat Tugas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] text-xs font-bold outline-none w-80 shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-[0.2em]">
                <th className="px-10 py-6">Informasi Tugas</th>
                <th className="px-10 py-6">Jenis & Biaya</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-fit">
                        {t.letterNumber || '–'}
                      </span>
                      <p className="text-sm font-black text-slate-800 leading-snug">{t.description}</p>
                      {isAdmin && t.employees[0] && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[8px] font-black uppercase">{t.employees[0].name.charAt(0)}</div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t.employees[0].name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Briefcase size={10} /> Jenis Penugasan</span>
                        <span className={`text-[11px] font-black uppercase ${t.activityType ? 'text-slate-700' : 'text-amber-600 italic'}`}>
                          {t.activityType || 'Belum ditentukan'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CreditCard size={10} /> Biaya</span>
                        <span className={`text-[11px] font-black uppercase ${t.fundingType ? 'text-slate-700' : 'text-amber-600 italic'}`}>
                          {t.fundingType || 'Belum diinput'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
                      t.reportStatus === ReportStatus.SUBMITTED 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {t.reportStatus === ReportStatus.SUBMITTED ? 'SUDAH LAPOR' : 'BELUM LAPOR'}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-end gap-2">
                      {t.reportStatus === ReportStatus.SUBMITTED ? (
                        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                          <button onClick={() => setShowPdfPreview(t)} className="p-3 text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm" title="Lihat Laporan"><Eye size={20} /></button>
                          <button onClick={() => handleOpenUpload(t, true)} className="p-3 text-amber-600 hover:bg-white rounded-xl transition-all shadow-sm" title="Edit Laporan"><Pencil size={20} /></button>
                          {isSuperAdmin && <button onClick={() => handleDeleteReport(t)} className="p-3 text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm" title="Hapus"><Trash2 size={20} /></button>}
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleOpenUpload(t)}
                          disabled={isSyncing}
                          className="flex items-center gap-3 px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                          ISI LAPORAN <Upload size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <BookOpen size={64} className="mb-4 text-slate-300" />
                       <p className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Tidak ada data laporan ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal - Tetap sama namun dengan styling konsisten */}
      {uploadModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in duration-300">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h4 className="font-black text-2xl text-slate-800 tracking-tighter uppercase leading-none">Penyusunan Laporan Kerja</h4>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-3">Nomor ST: {uploadModal.letterNumber}</p>
                 </div>
                 <button onClick={() => setUploadModal(null)} className="p-4 hover:bg-white rounded-2xl transition-all text-slate-400 shadow-sm border border-slate-200">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">IV. Uraian Pelaksanaan</label>
                       <textarea value={uraian} onChange={(e) => setUraian(e.target.value)} placeholder="Tuliskan detail pelaksanaan..." className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] text-sm min-h-[160px] outline-none focus:border-blue-600 focus:bg-white transition-all font-medium" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">V. Hasil yang Dicapai</label>
                       <textarea value={hasil} onChange={(e) => setHasil(e.target.value)} placeholder="Output nyata kegiatan..." className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] text-sm min-h-[160px] outline-none focus:border-blue-600 focus:bg-white transition-all font-medium" />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dokumentasi Foto (Wajib Min. 3)</label>
                       <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
                          <Camera size={16} /> Tambah Foto
                       </button>
                       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                       {tempPhotos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                             <img src={photo} className="w-full h-full object-cover" />
                             <button onClick={() => removePhoto(idx)} className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={24} />
                             </button>
                          </div>
                       ))}
                       {tempPhotos.length === 0 && <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest">Belum ada foto yang diunggah</div>}
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100">
                 <button 
                  onClick={handleUploadReport} 
                  disabled={isSyncing || !uraian.trim() || !hasil.trim() || tempPhotos.length < 3}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-6 rounded-[30px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-4 disabled:bg-slate-300 disabled:shadow-none"
                 >
                    {isSyncing ? <Loader2 className="animate-spin" size={24} /> : 'SIMPAN LAPORAN KERJA'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
