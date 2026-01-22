
import { Employee, EmployeeStatus, AssignmentTask, ReportStatus, ReportDetails } from './types';

declare const google: any;

/**
 * KONFIGURASI MULTI-SPREADSHEET
 */
// 1. Spreadsheet Database Pegawai (Lama)
const SPREADSHEET_PEGAWAI_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';
// 2. Spreadsheet Jadwal Penugasan (Baru)
const SPREADSHEET_JADWAL_ID = '1efjMOHknnC4RaYf9qTxPXGoLHSv5HelSMPYBqDi_y6s';

const getBaseUrl = (id: string) => `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;

const parseCSV = (text: string) => {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  for (let line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else current += char;
    }
    cells.push(current.trim());
    rows.push(cells.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim()));
  }
  return rows;
};

const parseDateSafely = (dateStr: string) => {
  if (!dateStr) return null;
  // Handle formats like YYYY-MM-DD or DD/MM/YYYY
  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  } else if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr);
};

export const fetchSpreadsheetData = async (): Promise<{ employees: Employee[], tasks: AssignmentTask[] }> => {
  try {
    let rawData: any;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Helper untuk fetch dari ID dan Sheet spesifik
    const fetchSheet = async (spreadsheetId: string, sheetName: string) => {
      const res = await fetch(`${getBaseUrl(spreadsheetId)}&sheet=${encodeURIComponent(sheetName)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Gagal fetch ${sheetName}`);
      return parseCSV(await res.text());
    };

    // Eksekusi penarikan data dari 2 Spreadsheet berbeda secara paralel
    const [p, s, d, l] = await Promise.all([
      fetchSheet(SPREADSHEET_PEGAWAI_ID, 'DATA_PEGAWAI'),
      fetchSheet(SPREADSHEET_JADWAL_ID, 'Jadwal Tugas'),
      fetchSheet(SPREADSHEET_PEGAWAI_ID, 'DISIPLIN_PEGAWAI'),
      fetchSheet(SPREADSHEET_PEGAWAI_ID, 'LAPORAN_TUGAS')
    ]);
    
    rawData = { 
      'DATA_PEGAWAI': p, 
      'Jadwal Tugas': s, 
      'DISIPLIN_PEGAWAI': d, 
      'LAPORAN_TUGAS': l 
    };

    // 1. PROSES DATA PEGAWAI (DARI SS LAMA)
    const employeesMap = new Map<string, Employee>();
    const rawPegawai = rawData['DATA_PEGAWAI'];
    if (rawPegawai && rawPegawai.length > 1) {
      rawPegawai.slice(1).forEach((row: any[]) => {
        const nip = String(row[0]);
        if (!nip) return;
        employeesMap.set(nip, {
          id: `emp-${nip}`,
          nip,
          name: row[1] || 'Pegawai',
          position: row[2] || '-',
          unit: row[3] || '-',
          status: EmployeeStatus.UNASSIGNED,
          disciplineScore: { attendance: 0, assembly: 0, dailyLog: 0, report: 0, final: 0 }
        });
      });
    }

    // 2. PROSES JADWAL TUGAS (DARI SS BARU)
    const tasksMap = new Map<string, AssignmentTask>();
    const rawSurat = rawData['Jadwal Tugas'];
    if (rawSurat && rawSurat.length > 1) {
      rawSurat.slice(1).forEach((row: any[]) => {
        const nip = String(row[0]);
        const letterNum = row[2]; // Nomor Surat (Kolom C)
        
        if (!nip || !letterNum) return;

        const jenisPenugasan = row[3] || 'Luring'; // Jenis (Kolom D)
        const namaKegiatan = row[4] || '-'; // Kegiatan (Kolom E)
        const lokasi = row[5] || '-'; // Lokasi (Kolom F)
        const tglMulai = String(row[6]); // Mulai (Kolom G)
        const tglSelesai = String(row[7]); // Selesai (Kolom H)
        const signee = row[8] || '-'; // Penandatangan (Kolom I)

        const start = parseDateSafely(tglMulai);
        const end = parseDateSafely(tglSelesai);
        
        const emp = employeesMap.get(nip);
        
        // Update status keberadaan pegawai secara real-time
        if (emp && start && end) {
          const startTime = new Date(start).setHours(0,0,0,0);
          const endTime = new Date(end).setHours(23,59,59,999);
          if (today.getTime() >= startTime && today.getTime() <= endTime) {
            emp.status = EmployeeStatus.ASSIGNED;
            (emp as any).activeActivity = namaKegiatan;
          }
        }

        if (tasksMap.has(letterNum)) {
          const existing = tasksMap.get(letterNum)!;
          if (emp && !existing.employees.find(e => e.nip === nip)) {
            existing.employees.push(emp);
          }
        } else {
          tasksMap.set(letterNum, {
            id: `task-${letterNum}`,
            letterNumber: letterNum,
            basis: '-',
            description: namaKegiatan,
            location: lokasi,
            startDate: tglMulai,
            endDate: tglSelesai,
            signee: signee,
            employees: emp ? [emp] : [], // Jika NIP ada di SS baru tapi tak ada di SS lama, list akan kosong (bisa ditangani di UI)
            activityType: jenisPenugasan as any,
            reportStatus: ReportStatus.PENDING,
            documentationPhotos: []
          });
        }
      });
    }

    // 3. PROSES DISIPLIN (DARI SS LAMA)
    const rawDisiplin = rawData['DISIPLIN_PEGAWAI'];
    if (rawDisiplin && rawDisiplin.length > 1) {
      rawDisiplin.slice(1).forEach((row: any[]) => {
        const nip = String(row[0]);
        const emp = employeesMap.get(nip);
        if (emp) {
          const att = parseFloat(row[1]) || 0;
          const assem = parseFloat(row[2]) || 0;
          const log = parseFloat(row[3]) || 0;
          const rep = parseFloat(row[4]) || 0;
          const fin = (att * 0.25) + (assem * 0.15) + (log * 0.20) + (rep * 0.40);
          emp.disciplineScore = { attendance: att, assembly: assem, dailyLog: log, report: rep, final: fin };
        }
      });
    }

    return {
      employees: Array.from(employeesMap.values()),
      tasks: Array.from(tasksMap.values())
    };
  } catch (error) {
    console.error('Sync Error:', error);
    // Return empty but consistent data if failed
    return { employees: [], tasks: [] };
  }
};
