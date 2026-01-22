
import React, { useState, useMemo } from 'react';
import { Employee, AssignmentTask, ActivityType, FundingType } from '../types';
import { FileText, Calendar, MapPin, AlignLeft, User, ChevronLeft, Globe, Users, CreditCard, AlertTriangle } from 'lucide-react';

interface FormPageProps {
  tasks: AssignmentTask[];
  selectedEmployees: Employee[];
  onPreview: (task: AssignmentTask) => void;
  onCancel: () => void;
}

const FormPage: React.FC<FormPageProps> = ({ tasks, selectedEmployees, onPreview, onCancel }) => {
  const [formData, setFormData] = useState({
    letterNumber: '800/ST/045/BPMP/2026',
    basis: 'Surat Undangan dari Kepala Dinas Pendidikan Provinsi No. 123/A/V/2026 perihal Koordinasi Penjaminan Mutu.',
    description: 'Melaksanakan koordinasi teknis penjaminan mutu pendidikan serta verifikasi data capaian indikator kinerja urusan pendidikan.',
    location: 'Dinas Pendidikan Provinsi Maluku Utara, Sofifi',
    startDate: '2026-01-20',
    endDate: '2026-01-22',
    signee: 'Dr. Santoso, S.Pd., M.Si.',
    activityType: 'Luring' as ActivityType,
    fundingType: 'Tanpa Biaya' as FundingType
  });

  const conflicts = useMemo(() => {
    if (formData.activityType !== 'Luring') return [];
    
    const conflictingEmps: string[] = [];
    const newStart = new Date(formData.startDate).getTime();
    const newEnd = new Date(formData.endDate).getTime();

    selectedEmployees.forEach(emp => {
      const hasConflict = tasks.some(task => {
        const isSelf = task.employees.some(e => e.nip === emp.nip);
        if (!isSelf || task.activityType !== 'Luring') return false;

        const taskStart = new Date(task.startDate).getTime();
        const taskEnd = new Date(task.endDate).getTime();
        
        return (newStart <= taskEnd && newEnd >= taskStart);
      });

      if (hasConflict) conflictingEmps.push(emp.name);
    });

    return conflictingEmps;
  }, [formData.startDate, formData.endDate, formData.activityType, selectedEmployees, tasks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflicts.length > 0) {
      alert(`PELANGGARAN ATURAN PENUGASAN:\n\nPegawai berikut sudah memiliki tugas Tatap Muka (Luring) pada tanggal yang sama:\n- ${conflicts.join('\n- ')}\n\nSilakan ubah jenis kegiatan menjadi Daring atau ganti tanggal penugasan.`);
      return;
    }

    onPreview({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      employees: selectedEmployees
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-white border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Form Pembuatan Surat Tugas</h3>
          <p className="text-slate-500 text-sm">Input data penugasan tahun anggaran 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm sticky top-6">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest text-blue-600">
              <User size={14} />
              Daftar Pegawai
            </h4>
            <div className="space-y-3">
              {selectedEmployees.map(emp => {
                const isConflicting = conflicts.includes(emp.name);
                return (
                  <div key={emp.id} className={`p-4 rounded-2xl border transition-all ${isConflicting ? 'bg-rose-50 border-rose-200 shadow-rose-100 shadow-inner' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-xs font-bold leading-tight ${isConflicting ? 'text-rose-700' : 'text-slate-800'}`}>{emp.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">{emp.nip}</p>
                    {isConflicting && (
                      <p className="text-[8px] font-black uppercase text-rose-500 mt-2 flex items-center gap-1">
                        <AlertTriangle size={10} /> Bentrok Luring
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-lg space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">I. Nomor Surat Tugas</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="letterNumber" value={formData.letterNumber} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">II. Jenis Kegiatan</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select name="activityType" value={formData.activityType} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-xs font-bold appearance-none">
                      <option value="Luring">Tatap Muka (Luring)</option>
                      <option value="Daring">Dalam Jaringan (Daring)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">III. Pembiayaan</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select name="fundingType" value={formData.fundingType} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-xs font-bold appearance-none">
                      <option value="Tanpa Biaya">Tanpa Biaya</option>
                      <option value="Biaya BPMP">Biaya BPMP</option>
                      <option value="Biaya Penyelenggara">Biaya Penyelenggara</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">IV. Uraian Tugas</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-sm leading-relaxed" required />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">V. Lokasi / Tempat</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="location" value={formData.location} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-sm" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Mulai</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-xs font-bold" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Selesai</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-xs font-bold" required />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-6 rounded-[30px] transition-all shadow-2xl shadow-blue-100 uppercase tracking-widest text-xs">
                Pratinjau Surat Tugas
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
