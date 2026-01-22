
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
  Briefcase,
  CheckCircle2,
  Download,
  FileText
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

  // Sesuai permintaan, semua orang bisa melihat semua laporan, tapi hanya owner yang bisa edit
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>(isAnyAdmin ? 'all' : 'mine');
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
    let result = tasks;

    if (activeTab === 'mine') {
      result = result.filter(t => t.employees.some(e => e.nip === currentUser?.nip));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(q) ||
        t.letterNumber.toLowerCase().includes(q) ||
        t.employees.some(e => e.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tasks, currentUser, activeTab, searchQuery]);

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

  const handleDownloadPdf = (task: AssignmentTask) => {
    setShowPdfPreview(task);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownloadWord = (task: AssignmentTask) => {
    alert(`Mengekspor Laporan ${task.letterNumber} ke format Word (DOCX)...`);
    // Placeholder for actual DOCX generation
  };

  const PdfPreviewModal = ({ task }: { task: AssignmentTask }) => {
    const pelapor = task.employees[0] || currentUser;
    const details = task.reportDetails;
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto font-serif p-16 md:p-24 relative animate-in fade-in zoom-in duration-300">
          <button onClick={() => setShowPdfPreview(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full text-slate-400 font-sans transition-colors no-print"><X size={28} /></button>
          
          <div className="flex flex-col items-center mb-10 pb-6 border-b-2 border-slate-900">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain mb-4" />
            <h1 className="text-xl font-bold uppercase tracking-widest text-center">LAPORAN PERTANGGUNGJAWABAN TUGAS</h1>
            <p className="text-sm font-sans font-bold mt-1">BPMP PROVINSI MALUKU UTARA</p>
          </div>

          <div className="space-y-8 text-[14px] leading-relaxed text-slate-900">
            <div className="grid grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl font-sans text-xs">
               <div className="flex flex-col">
                  <span className="font-black text-slate-400 uppercase mb-1">Kegiatan</span>
                  <span className="font-bold">{task.activityType}</span>
               </div>
               <div className="flex flex-col">
                  <span className="font-black text-slate-400 uppercase mb-1">Pembiayaan</span>
                  <span className="font-bold">{task.fundingType}</span>
               </div>
               <div className="flex flex-col">
                  <span className="font-black text-slate-400 uppercase mb-1">Mulai</span>
                  <span className="font-bold">{task.startDate}</span>
               </div>
               <div className="flex flex-col">
                  <span className="font-black text-slate-400 uppercase mb-1">Selesai</span>
                  <span className="font-bold">{task.endDate}</span>
               </div>
            </div>

            <section className="space-y-2">
               <h3 className="font-bold border-b border-slate-200 pb-1 uppercase tracking-tighter">I. Dasar Pelaksanaan</h3>
               <p className="ml-4 italic text-slate-600">Surat Tugas Nomor: {task.letterNumber}</p>
               <p className="ml-4">{task.basis}</p>
            </section>
            
            <section className="space-y-2">
               <h3 className="font-bold border-b border-slate-200 pb-1 uppercase tracking-tighter">II. Uraian Pelaksanaan</h3>
               <div className="ml-4 whitespace-pre-wrap leading-relaxed">{details?.uraian || "-"}</div>
            </section>
            
            <section className="space-y-2">
               <h3 className="font-bold border-b border-slate-200 pb-1 uppercase tracking-tighter">III. Hasil yang Dicapai</h3>
               <div className="ml-4 whitespace-pre-wrap leading-relaxed">{details?.hasil || "-"}</div>
            </section>

            {task.documentationPhotos && task.documentationPhotos.length > 0 && (
              <section className="space-y-4 pt-10 no-print">
                <h3 className="font-bold border-b border-slate-200 pb-1 uppercase text-xs">Lampiran Dokumentasi</h3>
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
              <p className="mt-8 mb-24 font-bold">Dilaporkan Oleh,</p>
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
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Arsip Laporan Tugas</h3>
            <p className="text-slate-500 text-sm mt-3 font-medium">Transparansi kinerja untuk akuntabilitas organisasi.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1.5 rounded-[22px] border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('mine')} className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mine' ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400'}`}>Laporan Saya</button>
          <button onClick={() => setActiveTab('all')} className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}>Seluruh Pegawai</button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Cari nama, nomor ST, atau uraian..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-xs font-bold outline-none w-80 shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-[0.2em]">
                <th className="px-10 py-6">Informasi Tugas</th>
                <th className="px-10 py-6">Pegawai / Unit</th>
                <th className="px-10 py-6">Jenis & Biaya</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(t => {
                const isOwner = t.reportCreatorNip === currentUser?.nip;
                const canEdit = isOwner;
                const hasReport = t.reportStatus === ReportStatus.SUBMITTED || t.reportStatus === ReportStatus.VERIFIED;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        <span className="w-fit text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{t.letterNumber}</span>
                        <p className="text-sm font-bold text-slate-700 leading-snug line-clamp-2">{t.description}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {t.employees[0] && (
                        <div className="flex flex-col">
                          <p className="font-black text-slate-800 text-xs uppercase">{t.employees[0].name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase mt-1">{t.employees[0].unit}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col gap-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md w-fit ${t.activityType === 'Luring' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                             {t.activityType}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 italic">
                             {t.fundingType}
                          </span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border ${
                        hasReport ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {t.reportStatus}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-2">
                        {hasReport ? (
                          <>
                            <button onClick={() => setShowPdfPreview(t)} className="p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors" title="Lihat Laporan"><Eye size={20} /></button>
                            <button onClick={() => handleDownloadPdf(t)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Download PDF"><Download size={20} /></button>
                            <button onClick={() => handleDownloadWord(t)} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Download Word"><FileText size={20} /></button>
                            {canEdit && <button onClick={() => handleOpenUpload(t, true)} className="p-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" title="Edit Laporan"><Pencil size={20} /></button>}
                          </>
                        ) : (
                          isOwner && <button onClick={() => handleOpenUpload(t)} className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-800 transition-all">Lapor <Upload size={16} /></button>
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
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Jenis & Biaya</p>
                       <div className="flex gap-2">
                          <span className="text-[8px] font-black uppercase bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{uploadModal.activityType}</span>
                          <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">{uploadModal.fundingType}</span>
                       </div>
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
