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
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2
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
  const isAnyAdmin = isSuperAdmin || isAdminTim;

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>(isAnyAdmin ? 'all' : 'pending');
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
    let result = isSuperAdmin 
      ? tasks 
      : isAdminTim 
        ? tasks.filter(t => t.employees.some(e => e.unit === currentUser?.unit) || isSuperAdmin)
        : tasks.filter(t => t.employees.some(e => e.nip === currentUser?.nip));

    if (activeTab === 'pending') {
      result = result.filter(t => t.reportStatus === ReportStatus.PENDING);
    } else if (activeTab === 'completed') {
      result = result.filter(t => t.reportStatus === ReportStatus.SUBMITTED || t.reportStatus === ReportStatus.VERIFIED);
    }

    if (searchQuery) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.letterNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [tasks, currentUser, isSuperAdmin, isAdminTim, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const userTasks = isSuperAdmin ? tasks : tasks.filter(t => t.employees.some(e => e.nip === currentUser?.nip));
    return {
      total: userTasks.length,
      pending: userTasks.filter(t => t.reportStatus === ReportStatus.PENDING).length,
      completed: userTasks.filter(t => t.reportStatus === ReportStatus.SUBMITTED || t.reportStatus === ReportStatus.VERIFIED).length
    };
  }, [tasks, currentUser, isSuperAdmin]);

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
      const updated: AssignmentTask = {
        ...uploadModal,
        reportStatus: ReportStatus.SUBMITTED,
        reportDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        reportSummary: JSON.stringify(details),
        reportCreatorNip: currentUser.nip,
        reportDetails: details,
        documentationPhotos: tempPhotos
      };
      onUpdateTask(updated);
      setUploadModal(null);
      setIsSyncing(false);
    }, 1000);
  };

  const handleVerifyReport = (task: AssignmentTask) => {
    if (window.confirm("Verifikasi laporan ini?")) {
      onUpdateTask({ ...task, reportStatus: ReportStatus.VERIFIED });
    }
  };

  const handleDeleteReport = (task: AssignmentTask) => {
    if (window.confirm("Hapus laporan ini secara permanen?")) {
      onUpdateTask({
        ...task,
        reportStatus: ReportStatus.PENDING,
        reportDate: undefined,
        reportSummary: undefined,
        reportDetails: undefined,
        documentationPhotos: []
      });
    }
  };

  const PdfPreviewModal = ({ task }: { task: AssignmentTask }) => {
    // Fixed: 't' was undefined, changed to 'task' to correctly reference the assignment data.
    const pelapor = task.employees[0] || currentUser;
    const details = task.reportDetails;
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto font-serif p-16 md:p-24 relative animate-in fade-in zoom-in duration-300">
          <button onClick={() => setShowPdfPreview(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full text-slate-400 font-sans transition-colors no-print"><X size={28} /></button>
          <div className="text-center mb-12">
            <h1 className="text-lg font-bold uppercase tracking-widest leading-tight">LAPORAN PELAKSANAAN TUGAS</h1>
            <h2 className="text-lg font-bold uppercase tracking-tight mt-1">{task.description}</h2>
          </div>
          <div className="space-y-8 text-[14px] leading-relaxed text-slate-900">
            <section className="space-y-2">
               <h3 className="font-bold border-b border-slate-200 pb-1">I. PENDAHULUAN</h3>
               <p className="ml-4">Laporan ini disusun sebagai pertanggungjawaban atas pelaksanaan penugasan sesuai Surat Tugas Nomor {task.letterNumber}.</p>
            </section>
            <section className="space-y-2">
               <h3 className="font-bold border-b border-slate-200 pb-1">II. PELAKSANAAN</h3>
               <div className="ml-4 whitespace-pre-wrap">{details?.uraian || "-"}</div>
            </section>
            <section className="space-y-2">
               <h3 className="font-bold border-b border-slate-200 pb-1">III. HASIL CAPAIAN</h3>
               <div className="ml-4 whitespace-pre-wrap">{details?.hasil || "-"}</div>
            </section>
            {task.documentationPhotos && task.documentationPhotos.length > 0 && (
              <section className="space-y-4 pt-10">
                <h3 className="font-bold border-b border-slate-200 pb-1 uppercase">Lampiran Dokumentasi</h3>
                <div className="grid grid-cols-3 gap-4">
                  {task.documentationPhotos.map((photo, idx) => (
                    <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={photo} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          <div className="mt-20 flex justify-end">
            <div className="text-left w-72 font-sans">
              <p>Ternate, {task.reportDate}</p>
              <p className="mt-8 mb-24 font-bold">Dibuat oleh,</p>
              <p className="font-bold underline uppercase">{pelapor.name}</p>
              <p className="text-xs text-slate-500">NIP. {pelapor.nip}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Manajemen Pelaporan</h3>
            <p className="text-slate-500 text-sm mt-3 font-medium">Monitoring pertanggungjawaban tugas kerja tuntas.</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center px-6 py-2 border-r border-slate-100">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Belum Lapor</p>
            <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
          </div>
          <div className="text-center px-6 py-2">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Selesai</p>
            <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1.5 rounded-[22px] border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('pending')} className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}>Perlu Dilaporkan</button>
          <button onClick={() => setActiveTab('completed')} className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>Sudah Dilaporkan</button>
          {isAnyAdmin && <button onClick={() => setActiveTab('all')} className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400'}`}>Semua Laporan</button>}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Cari nomor ST atau uraian..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-xs font-bold outline-none w-72 shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-[0.2em]">
                <th className="px-10 py-6">Informasi Penugasan</th>
                <th className="px-10 py-6">Kegiatan</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(t => {
                const isOwner = t.reportCreatorNip === currentUser?.nip;
                const canEdit = isOwner || isSuperAdmin;
                const canVerify = isAnyAdmin && t.reportStatus === ReportStatus.SUBMITTED;
                const canDelete = isOwner || isSuperAdmin;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        <span className="w-fit text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{t.letterNumber}</span>
                        {isAnyAdmin && t.employees[0] && (
                           <div className="flex flex-col">
                              <p className="font-bold text-slate-800 text-xs uppercase">{t.employees[0].name}</p>
                              <p className="text-[9px] text-slate-400 font-mono">{t.employees[0].nip}</p>
                           </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1"><Briefcase size={10} /> Nama Kegiatan:</p>
                        <p className="text-sm font-bold text-slate-700 leading-snug">{t.description}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{t.location} | {t.startDate}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border ${
                        t.reportStatus === ReportStatus.VERIFIED ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        t.reportStatus === ReportStatus.SUBMITTED ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                      }`}>
                        {t.reportStatus}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-2">
                        {(t.reportStatus === ReportStatus.SUBMITTED || t.reportStatus === ReportStatus.VERIFIED) ? (
                          <>
                            <button onClick={() => setShowPdfPreview(t)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Lihat PDF"><Eye size={20} /></button>
                            {canEdit && <button onClick={() => handleOpenUpload(t, true)} className="p-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" title="Edit Laporan"><Pencil size={20} /></button>}
                            {canVerify && <button onClick={() => handleVerifyReport(t)} className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="Verifikasi Laporan"><CheckCircle2 size={20} /></button>}
                            {canDelete && <button onClick={() => handleDeleteReport(t)} className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Hapus Laporan"><Trash2 size={20} /></button>}
                          </>
                        ) : (
                          <button onClick={() => handleOpenUpload(t)} className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-800 transition-all">Lapor <Upload size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {uploadModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-slate-200">
              <div className="w-full md:w-1/3 bg-slate-50 p-10 overflow-y-auto border-r border-slate-100">
                 <h5 className="font-black uppercase tracking-[0.2em] text-[10px] text-blue-700 mb-8 flex items-center gap-2"><BookOpen size={16} /> Data Dasar Tugas</h5>
                 <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-slate-400 uppercase">Surat Penugasan</label>
                       <p className="text-xs font-mono font-bold text-slate-800">{uploadModal.letterNumber}</p>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-400 uppercase">Nama Kegiatan</label>
                       <p className="text-sm font-bold text-slate-800 leading-relaxed">{uploadModal.description}</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-10 md:p-14 bg-white flex flex-col relative overflow-y-auto">
                 <button onClick={() => setUploadModal(null)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                 <div className="mb-8">
                    <h4 className="font-black text-3xl text-slate-800 tracking-tighter uppercase">{isEditMode ? 'Edit Laporan' : 'Formulir Laporan'}</h4>
                    <p className="text-slate-500 text-sm mt-2 font-medium italic">Wajib diisi sesuai fakta pelaksanaan tugas.</p>
                 </div>

                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">IV. Uraian Pelaksanaan (Poin-poin)</label>
                         <textarea value={uraian} onChange={(e) => setUraian(e.target.value)} placeholder="Tuliskan poin-poin pelaksanaan kegiatan..." className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[20px] text-sm min-h-[120px] outline-none focus:border-blue-600 transition-all font-medium" />
                      </div>
                      <div className="space-y-3">
                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">V. Hasil yang Dicapai (Konkret)</label>
                         <textarea value={hasil} onChange={(e) => setHasil(e.target.value)} placeholder="Tuliskan output konkret kegiatan..." className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[20px] text-sm min-h-[120px] outline-none focus:border-blue-600 transition-all font-medium" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Lampiran Foto Dokumentasi ({tempPhotos.length}/3 minimal)</label>
                        <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase text-blue-700 flex items-center gap-2 hover:underline"><Camera size={14} /> Tambah Foto</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {tempPhotos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                            <img src={photo} className="w-full h-full object-cover" />
                            <button onClick={() => removePhoto(idx)} className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>

                 <div className="pt-10 mt-auto">
                    <button onClick={handleUploadReport} disabled={isSyncing || !uraian.trim() || !hasil.trim() || tempPhotos.length < 3} className="w-full bg-blue-700 text-white py-6 rounded-[30px] font-black shadow-xl hover:bg-blue-800 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-4 disabled:bg-slate-200">
                       {isSyncing ? <Loader2 className="animate-spin" size={20} /> : (isEditMode ? 'PERBARUI LAPORAN' : 'KIRIM LAPORAN SEKARANG')}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showPdfPreview && <PdfPreviewModal task={showPdfPreview} />}
    </div>
  );
};

export default ReportsPage;