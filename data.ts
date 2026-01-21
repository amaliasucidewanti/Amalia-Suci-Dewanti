
import { Employee, EmployeeStatus, AssignmentTask, ReportStatus, ReportDetails } from './types';

declare const google: any;

const SPREADSHEET_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;

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
    rows.push(cells.map(c => c.replace(/^"|"$/g, '').trim()));
  }
  return rows;
};

export const fetchSpreadsheetData = async (): Promise<{ employees: Employee[], tasks: AssignmentTask[] }> => {
  try {
    let rawData: any;

    // Deteksi jika berjalan di lingkungan Google Apps Script
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      rawData = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .getSpreadsheetData();
      });
    } else {
      // Fallback untuk local development
      const fetchSheet = async (name: string) => {
        const res = await fetch(`${BASE_URL}&sheet=${name}`, { cache: 'no-store' });
        return parseCSV(await res.text());
      };
      const [p, s, d, l] = await Promise.all([
        fetchSheet('DATA_PEGAWAI'),
        fetchSheet('SURAT_TUGAS'),
        fetchSheet('DISIPLIN_PEGAWAI'),
        fetchSheet('LAPORAN_TUGAS')
      ]);
      rawData = { 'DATA_PEGAWAI': p, 'SURAT_TUGAS': s, 'DISIPLIN_PEGAWAI': d, 'LAPORAN_TUGAS': l };
    }

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

    const reportsMap = new Map<string, { summary: string, date: string, nip: string }>();
    const rawLaporan = rawData['LAPORAN_TUGAS'];
    if (rawLaporan && rawLaporan.length > 1) {
      rawLaporan.slice(1).forEach((row: any[]) => {
        const letterNum = row[0];
        if (letterNum) reportsMap.set(letterNum, { summary: row[1], date: row[2], nip: row[3] });
      });
    }

    const tasksMap = new Map<string, AssignmentTask>();
    const rawSurat = rawData['SURAT_TUGAS'];
    if (rawSurat && rawSurat.length > 1) {
      rawSurat.slice(1).forEach((row: any[]) => {
        const nip = String(row[0]);
        const letterNum = row[1];
        if (!nip || !letterNum) return;

        const emp = employeesMap.get(nip);
        if (emp) emp.status = EmployeeStatus.ASSIGNED;

        if (tasksMap.has(letterNum)) {
          const existing = tasksMap.get(letterNum)!;
          if (emp && !existing.employees.find(e => e.nip === nip)) existing.employees.push(emp);
        } else {
          const report = reportsMap.get(letterNum);
          let reportDetails: ReportDetails | undefined;
          
          if (report?.summary && report.summary.startsWith('{')) {
            try { reportDetails = JSON.parse(report.summary); } catch (e) {}
          }

          tasksMap.set(letterNum, {
            id: `task-${letterNum}`,
            letterNumber: letterNum,
            basis: row[2] || '-',
            description: row[3] || '-',
            location: row[4] || '-',
            startDate: row[5] || '',
            endDate: row[6] || '',
            signee: row[7] || '-',
            employees: emp ? [emp] : [],
            reportStatus: report ? ReportStatus.SUBMITTED : ReportStatus.PENDING,
            reportSummary: report?.summary || '',
            reportCreatorNip: report?.nip || '',
            reportDate: report?.date || '',
            reportDetails: reportDetails
          });
        }
      });
    }

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

export const MOCK_CHART_DATA = [
  { name: 'Jan', bertugas: 45, tidak: 10 },
  { name: 'Feb', bertugas: 48, tidak: 7 },
  { name: 'Mar', bertugas: 42, tidak: 13 },
  { name: 'Apr', bertugas: 50, tidak: 5 },
  { name: 'Mei', bertugas: 55, tidak: 8 },
  { name: 'Jun', bertugas: 60, tidak: 12 },
];
