
import React from 'react';
import { AssignmentTask } from '../types';
import { Printer, Download, Edit, Save, FileCheck, Globe, CreditCard } from 'lucide-react';
import { LOGO_URL } from '../App';

interface PreviewPageProps {
  task: AssignmentTask;
  onBack: () => void;
  onSave: () => void;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ task, onBack, onSave }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <h3 className="text-xl font-bold text-slate-800">Pratinjau Surat Tugas Resmi</h3>
        <div className="flex gap-2">
          <button onClick={onBack} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Edit size={16} />
            Edit Data
          </button>
          <button onClick={() => window.print()} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Printer size={16} />
            Cetak PDF
          </button>
          <button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 uppercase tracking-widest">
            <Save size={16} />
            Simpan & Terbitkan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-12 md:p-16 min-h-[1050px] relative overflow-hidden font-serif">
        {/* Letterhead */}
        <div className="flex items-start border-b-[3px] border-slate-900 pb-4 mb-8">
          <div className="w-24 h-24 flex items-center justify-center shrink-0">
            <img src={LOGO_URL} alt="Logo Kemendikdasmen" className="w-20 h-20 object-contain" />
          </div>
          <div className="flex-1 text-center pr-12">
            <h1 className="text-lg font-bold uppercase tracking-tight leading-tight">Kementerian Pendidikan Dasar dan Menengah</h1>
            <h2 className="text-xl font-black uppercase tracking-wide leading-tight mt-1">Balai Penjaminan Mutu Pendidikan (BPMP)</h2>
            <h3 className="text-lg font-bold uppercase tracking-wide leading-tight">Provinsi Maluku Utara</h3>
            <p className="text-[10px] mt-2 font-sans font-medium">Jl. Raya Rum - Sofifi, Ternate, Maluku Utara 97725</p>
            <p className="text-[10px] font-sans font-medium">Laman: bpmpmalut.kemdikbud.go.id | Pos-el: bpmp.malut@kemdikbud.go.id</p>
          </div>
        </div>

        {/* Info Box (Internal Layout Details) */}
        <div className="grid grid-cols-2 gap-4 mb-8 no-print font-sans">
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
              <Globe size={20} className="text-blue-600" />
              <div>
                 <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Jenis Kegiatan</p>
                 <p className="text-sm font-black text-blue-800">{task.activityType}</p>
              </div>
           </div>
           <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
              <CreditCard size={20} className="text-emerald-600" />
              <div>
                 <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Pembiayaan</p>
                 <p className="text-sm font-black text-emerald-800">{task.fundingType}</p>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="text-center mb-10">
          <h3 className="text-xl font-bold underline decoration-2 underline-offset-4 uppercase tracking-widest">Surat Tugas</h3>
          <p className="text-sm font-sans mt-1 font-bold">Nomor: {task.letterNumber}</p>
        </div>

        <div className="space-y-6 text-[14px] leading-relaxed">
          <div className="flex gap-6">
            <span className="w-28 shrink-0 font-bold uppercase">Menimbang</span>
            <span className="shrink-0">:</span>
            <div className="flex-1 space-y-2">
              <p>Bahwa dalam rangka pelaksanaan program kerja BPMP Provinsi Maluku Utara Tahun Anggaran 2026, khususnya kegiatan <strong>{task.description}</strong>, dipandang perlu menugaskan personil yang berkompeten.</p>
            </div>
          </div>

          <div className="flex gap-6">
            <span className="w-28 shrink-0 font-bold uppercase">Dasar</span>
            <span className="shrink-0">:</span>
            <div className="flex-1 italic">
              <p>{task.basis}</p>
            </div>
          </div>

          <div className="pt-6 text-center">
            <h4 className="font-black uppercase tracking-[0.2em] text-lg border-y border-slate-200 py-1 inline-block">Memberi Tugas</h4>
          </div>

          <div className="flex gap-6">
            <span className="w-28 shrink-0 font-bold uppercase">Kepada</span>
            <span className="shrink-0">:</span>
            <div className="flex-1 space-y-8">
              {task.employees.map((emp, i) => (
                <div key={emp.id} className="flex flex-col">
                  <div className="flex gap-6">
                    <span className="w-36">Nama</span>
                    <span>: <strong>{emp.name}</strong></span>
                  </div>
                  <div className="flex gap-6">
                    <span className="w-36">NIP</span>
                    <span>: {emp.nip}</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="w-36">Jabatan</span>
                    <span>: {emp.position}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 pt-4">
            <span className="w-28 shrink-0 font-bold uppercase">Untuk</span>
            <span className="shrink-0">:</span>
            <div className="flex-1 space-y-4">
              <ol className="list-decimal pl-4 space-y-3">
                <li>Melaksanakan kegiatan <strong>{task.description}</strong> secara <strong>{task.activityType}</strong>.</li>
                <li>Terhitung mulai tanggal {new Date(task.startDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})} sampai dengan {new Date(task.endDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}.</li>
                <li>Lokasi pelaksanaan di {task.location}.</li>
                <li>Pembiayaan kegiatan dibebankan pada komponen <strong>{task.fundingType}</strong>.</li>
                <li>Wajib menyampaikan laporan tertulis selambat-lambatnya 3 (tiga) hari kerja setelah tugas selesai.</li>
              </ol>
            </div>
          </div>

          <p className="pt-6">Demikian Surat Tugas ini diterbitkan untuk dilaksanakan dengan penuh dedikasi dan tanggung jawab.</p>
        </div>

        {/* Signature */}
        <div className="mt-20 flex justify-end">
          <div className="w-80 text-center font-sans">
            <p>Ditetapkan di: Ternate</p>
            <p className="mb-24">Pada Tanggal: {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            <p className="font-bold mb-1 underline decoration-1 underline-offset-2">{task.signee}</p>
            <p className="text-xs">NIP. 197005121995011001</p>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none rotate-45 scale-[3]">
            <h1 className="text-9xl font-black uppercase text-blue-900">BPMP MALUT</h1>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
