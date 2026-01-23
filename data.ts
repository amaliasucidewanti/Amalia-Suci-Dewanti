
import { Employee, EmployeeStatus, AssignmentTask, ReportStatus, ReportDetails } from './types';

declare const google: any;

/**
 * KONFIGURASI SINGLE SPREADSHEET TERKUNCI
 * ID: 1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc
 */
const SPREADSHEET_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fetchSheet = async (sheetName: string) => {
      const res = await fetch(`${getBaseUrl(SPREADSHEET_ID)}&sheet=${encodeURIComponent(sheetName)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Gagal fetch sheet: ${sheetName}`);
      return parseCSV(await res.text());
    };

    const [p, s, d, l] = await Promise.all([
      fetchSheet('DATA_PEGAWAI'),
      fetchSheet('SURAT_TUGAS'),
      fetchSheet('DISIPLIN_PEGAWAI'),
      fetchSheet('LAPORAN_TUGAS')
    ]);
    
    const rawData = { 
      'DATA_PEGAWAI': p, 
      'SURAT_TUGAS': s, 
      'DISIPLIN_PEGAWAI': d, 
      'LAPORAN_TUGAS': l 
    };

    // 1. PROSES DATA PEGAWAI
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

    // 2. PROSES SURAT TUGAS
    const tasksMap = new Map<string, AssignmentTask>();
    const rawSurat = rawData['SURAT_TUGAS'];
    if (rawSurat && rawSurat.length > 1) {
      rawSurat.slice(1).forEach((row: any[]) => {
        const nip = String(row[0]);
        const letterNum = row[1]; // Nomor Surat Tugas
        
        if (!nip || !letterNum) return;

        const description = row[3] || '-'; // Nama Kegiatan
        const location = row[4] || '-';
        const tglMulai = String(row[5]);
        const tglSelesai = String(row[6]);
        const signee = row[7] || '-';
        const activityType = row[8] || ''; // Jenis Penugasan
        const fundingType = row[9] || ''; // Biaya

        const start = parseDateSafely(tglMulai);
        const end = parseDateSafely(tglSelesai);
        
        const emp = employeesMap.get(nip);
        
        if (emp && start && end) {
          const startTime = new Date(start).setHours(0,0,0,0);
          const endTime = new Date(end).setHours(23,59,59,999);
          if (today.getTime() >= startTime && today.getTime() <= endTime) {
            emp.status = EmployeeStatus.ASSIGNED;
            (emp as any).activeActivity = description;
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
            basis: row[2] || '-',
            description: description,
            location: location,
            startDate: tglMulai,
            endDate: tglSelesai,
            signee: signee,
            employees: emp ? [emp] : [],
            activityType: activityType as any,
            fundingType: fundingType as any,
            reportStatus: ReportStatus.PENDING,
            documentationPhotos: []
          });
        }
      });
    }

    // 3. PROSES DATA LAPORAN
    const rawLaporan = rawData['LAPORAN_TUGAS'];
    if (rawLaporan && rawLaporan.length > 1) {
      rawLaporan.slice(1).forEach((row: any[]) => {
        const letterNum = String(row[0]);
        const nip = String(row[3]);
        const task = tasksMap.get(letterNum);
        if (task) {
          task.reportStatus = ReportStatus.SUBMITTED;
          task.reportDate = String(row[2]);
          task.reportCreatorNip = nip;
          try {
            task.reportDetails = JSON.parse(row[1]);
          } catch (e) {
            task.reportSummary = row[1];
          }
          if (row[4]) {
            try {
              task.documentationPhotos = JSON.parse(row[4]);
            } catch (e) {
              task.reportFileUrl = row[4];
            }
          }
        }
      });
    }

    // 4. PROSES DISIPLIN
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
    return { employees: [], tasks: [] };
  }
};
