
import React, { useState, useMemo, useRef } from 'react';
import { ReportStatus, AssignmentTask, ReportDetails } from '../types';
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
  Calendar
} from 'lucide-react';
import { LOGO_URL } from '../App';

interface ReportsPageProps {
  tasks: AssignmentTask[];
  currentUser: any;
  onUpdateTask: (task: AssignmentTask) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ tasks, currentUser, onUpdateTask }) => {
  const isAdmin = currentUser?.nip === 'Admin';
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

    return result;
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
      reader.onloadend = () => {
        setTempPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setTempPhotos(prev => prev.filter((_, i) => i !== index));
  };

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
    
    const details: ReportDetails = {
      uraian,
      hasil,
      kendala: kendala.trim() || undefined,
      solusi: solusi.trim() || undefined
    };

    setTimeout(() => {
      const updated: AssignmentTask = {
        ...uploadModal,
        reportStatus: ReportStatus.SUBMITTED,
        reportDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        reportSummary: JSON.stringify(details),
        reportCreatorNip: currentUser.nip,
        reportDetails: details,
        documentationPhotos: tempPhotos
      };
      
      onUpdateTask(updated);
      setUploadModal(null);
      setIsSyncing(false);
      alert(isEditMode ? "LAPORAN BERHASIL DIPERBARUI!" : "LAPORAN BERHASIL DISIMPAN!");
    }, 1000);
  };

  const handleDeleteReport = (task: AssignmentTask) => {
    if (window.confirm("Apakah Anda yakin ingin MENGHAPUS laporan ini? Status tugas akan kembali menjadi 'Belum Lapor'.")) {
      setIsSyncing(true);
      setTimeout(() => {
        const resetTask: AssignmentTask = {
          ...task,
          reportStatus: ReportStatus.PENDING,
          reportDate: undefined,
          reportSummary: undefined,
          reportDetails: undefined,
          documentationPhotos: []
        };
        onUpdateTask(resetTask);
        setIsSyncing(false);
        alert("Laporan telah dihapus dari arsip.");
      }, 800);
    }
  };

  const PdfPreviewModal = ({ task }: { task: AssignmentTask }) => {
    const pelapor = isAdmin ? (task.employees[0] || currentUser) : currentUser;
    const details = task.reportDetails;

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto font-serif p-16 md:p-20 relative animate-in fade-in zoom-in duration-300">
          <button onClick={() => setShowPdfPreview(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full text-slate-400 font-sans transition-colors no-print">
            <X size={28} />
          </button>
          
          <div className="flex flex-col items-center mb-10 pb-4 border-b-2 border-slate-900">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain mb-4" />
            <h1 className="text-xl font-bold uppercase leading-tight text-center">LAPORAN PELAKSANAAN TUGAS</h1>
            <p className="text-sm font-sans font-bold mt-1">BPMP PROVINSI MALUKU UTARA</p>
          </div>

          <div className="space-y-8 text-[14px] leading-relaxed text-slate-900">
            <section className="space-y-2">
              <h3 className="font-bold">I. Identitas Pegawai</h3>
              <div className="grid grid-cols-4 gap-x-4 ml-4">
                <span className="w-32">Nama</span>
                <span className="col-span-3">: {pelapor.name}</span>
                <span className="w-32">NIP</span>
                <span className="col-span-3">: {pelapor.nip}</span>
                <span className="w-32">Jabatan</span>
                <span className="col-span-3">: {pelapor.position}</span>
                <span className="w-32">Unit Kerja</span>
                <span className="col-span-3">: {pelapor.unit}</span>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold">II. Dasar Pelaksanaan</h3>
              <p className="ml-4 italic text-xs text-slate-500">(Surat tugas / disposisi / perintah atasan)</p>
              <div className="grid grid-cols-4 gap-x-4 ml-4">
                <span className="w-32">Nomor</span>
                <span className="col-span-3">: {task.letterNumber}</span>
                <span className="w-32">Tanggal</span>
                <span className="col-span-3">: {task.startDate}</span>
                <span className="w-32">Pejabat pemberi tugas</span>
                <span className="col-span-3">: {task.signee}</span>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold">III. Waktu dan Tempat</h3>
              <div className="grid grid-cols-4 gap-x-4 ml-4">
                <span className="w-32">Hari/Tanggal</span>
                <span className="col-span-3">: {task.startDate} s.d {task.endDate}</span>
                <span className="w-32">Waktu</span>
                <span className="col-span-3">: Jam Kerja / Sesuai Agenda</span>
                <span className="w-32">Tempat</span>
                <span className="col-span-3">: {task.location}</span>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold">IV. Uraian Pelaksanaan Tugas</h3>
              <p className="ml-4 italic text-xs text-slate-500">(Jelaskan singkat, poin-poin saja)</p>
              <div className="ml-4 whitespace-pre-wrap leading-relaxed">
                {details?.uraian || "-"}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold">V. Hasil yang Dicapai</h3>
              <p className="ml-4 italic text-xs text-slate-500">(Hasil konkret, output kegiatan)</p>
              <div className="ml-4 whitespace-pre-wrap leading-relaxed">
                {details?.hasil || "-"}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold">VI. Kendala dan Solusi (opsional)</h3>
              <div className="grid grid-cols-4 gap-x-4 ml-4">
                <span className="w-32">Kendala</span>
                <span className="col-span-3">: {details?.kendala || "-"}</span>
                <span className="w-32">Solusi</span>
                <span className="col-span-3">: {details?.solusi || "-"}</span>
              </div>
            </section>

            <section className="space-y-2 pt-4">
              <h3 className="font-bold">VII. Penutup</h3>
              <p>Demikian laporan pelaksanaan tugas ini disusun sebagai bentuk pertanggungjawaban pelaksanaan tugas yang diberikan.</p>
            </section>

            {task.documentationPhotos && task.documentationPhotos.length > 0 && (
              <section className="space-y-4 pt-10 no-print">
                <h3 className="font-bold uppercase text-[10px] tracking-widest text-blue-700">Lampiran Dokumentasi</h3>
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
            <div className="text-center w-80 font-sans">
              <p>Ternate, {task.reportDate || new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
              <p className="mb-24 mt-2 font-bold">Pelapor,</p>
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
          <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain hidden md:block" />
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Manajemen Pelaporan</h3>
            <p className="text-slate-500 text-sm mt-3 font-medium">Lengkapi pertanggungjawaban tugas Anda sesuai format resmi.</p>
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
          <button onClick={() => setActiveTab('all')} className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400'}`}>Semua Tugas</button>
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
                <th className="px-10 py-6">Informasi ST</th>
                <th className="px-10 py-6">Detail Penugasan</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(t => {
                const isCreator = t.reportCreatorNip === currentUser?.nip;
                const displayEmployee = t.employees[0] || (isAdmin ? null : currentUser);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-3">
                        <span className="w-fit text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{t.letterNumber}</span>
                        {displayEmployee && (
                          <div className="flex flex-col">
                            <p className="font-bold text-blue-700 text-xs uppercase tracking-tight">{displayEmployee.name}</p>
                            <p className="text-[9px] font-mono text-slate-400 mt-0.5">{displayEmployee.nip}</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Kegiatan:</p>
                        <p className="text-sm font-bold text-slate-700 leading-snug">{t.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                           <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                             <MapPin size={12} className="text-slate-300" /> {t.location}
                           </p>
                           <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                             <Calendar size={12} className="text-slate-300" /> {t.startDate}
                           </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border ${t.reportStatus === ReportStatus.SUBMITTED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'}`}>
                        {t.reportStatus}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-2">
                        {t.reportStatus === ReportStatus.SUBMITTED ? (
                          <>
                            <button onClick={() => setShowPdfPreview(t)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Lihat PDF"><Eye size={20} /></button>
                            {(isCreator || isAdmin) && (
                              <>
                                <button onClick={() => handleOpenUpload(t, true)} className="p-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" title="Edit Laporan"><Pencil size={20} /></button>
                                <button onClick={() => handleDeleteReport(t)} className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Hapus Laporan"><Trash2 size={20} /></button>
                              </>
                            )}
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
                    <p className="text-slate-500 text-sm mt-2 font-medium italic">Wajib diisi untuk verifikasi pertanggungjawaban tugas.</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">VI. Kendala (Opsional)</label>
                         <input type="text" value={kendala} onChange={(e) => setKendala(e.target.value)} placeholder="Tuliskan kendala jika ada..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-blue-600 transition-all" />
                      </div>
                      <div className="space-y-3">
                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">VI. Solusi (Opsional)</label>
                         <input type="text" value={solusi} onChange={(e) => setSolusi(e.target.value)} placeholder="Tuliskan solusi yang diberikan..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-blue-600 transition-all" />
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
