
import React, { useState } from 'react';
import { Employee, AssignmentTask } from '../types';
import { FileText, Calendar, MapPin, AlignLeft, User, ChevronLeft } from 'lucide-react';

interface FormPageProps {
  selectedEmployees: Employee[];
  onPreview: (task: AssignmentTask) => void;
  onCancel: () => void;
}

const FormPage: React.FC<FormPageProps> = ({ selectedEmployees, onPreview, onCancel }) => {
  const [formData, setFormData] = useState({
    letterNumber: '800/ST/045/BPMP/2026',
    basis: 'Surat Undangan dari Kepala Dinas Pendidikan Provinsi No. 123/A/V/2026 perihal Koordinasi Penjaminan Mutu.',
    description: 'Melaksanakan koordinasi teknis penjaminan mutu pendidikan serta verifikasi data capaian indikator kinerja urusan pendidikan.',
    location: 'Dinas Pendidikan Provinsi Maluku Utara, Sofifi',
    startDate: '2026-01-20',
    endDate: '2026-01-22',
    signee: 'Dr. Santoso, S.Pd., M.Si.'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <p className="text-slate-500 text-sm">Lengkapi data penugasan (Tahun Anggaran 2026)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selected Employees Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest text-blue-600">
              <User size={14} />
              Pegawai Terpilih
            </h4>
            <div className="space-y-3">
              {selectedEmployees.map(emp => (
                <div key={emp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{emp.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{emp.nip}</p>
                  <p className="text-[10px] text-slate-600 italic mt-0.5">{emp.position}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nomor Surat Tugas</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    name="letterNumber"
                    value={formData.letterNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dasar Penugasan</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    name="basis"
                    value={formData.basis}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Uraian Tugas / Maksud</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi Penugasan</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Mulai</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Selesai</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Penandatangan (Pejabat)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    name="signee"
                    value={formData.signee}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button 
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-widest text-sm"
              >
                Pratinjau Surat Tugas Resmi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
