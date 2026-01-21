
export enum EmployeeStatus {
  ASSIGNED = 'Bertugas',
  UNASSIGNED = 'Tidak Bertugas'
}

export enum ReportStatus {
  PENDING = 'Belum Upload',
  SUBMITTED = 'Sudah Upload',
  VERIFIED = 'Terverifikasi'
}

export interface ReportDetails {
  uraian: string;
  hasil: string;
  kendala?: string;
  solusi?: string;
}

export interface Employee {
  id: string;
  name: string;
  nip: string;
  position: string;
  unit: string;
  status: EmployeeStatus;
  disciplineScore: {
    attendance: number;
    assembly: number;
    dailyLog: number;
    report: number;
    final: number;
  };
}

export interface AssignmentTask {
  id: string;
  letterNumber: string;
  basis: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  signee: string;
  employees: Employee[];
  reportStatus?: ReportStatus;
  reportDate?: string;
  reportSummary?: string; // Digunakan untuk menyimpan JSON detail laporan
  reportCreatorNip?: string; // NIP pegawai yang membuat laporan
  reportDetails?: ReportDetails;
  reportFileUrl?: string;
  documentationPhotos?: string[]; // Array of base64 image strings
}

export type Page = 'login' | 'dashboard' | 'employees' | 'calendar' | 'unassigned' | 'form' | 'preview' | 'discipline' | 'reports';
