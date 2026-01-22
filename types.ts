
export enum EmployeeStatus {
  ASSIGNED = 'Bertugas',
  UNASSIGNED = 'Tidak Bertugas'
}

export enum ReportStatus {
  PENDING = 'Belum Upload',
  SUBMITTED = 'Sudah Upload',
  VERIFIED = 'Terverifikasi'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_TIM = 'ADMIN_TIM',
  PEGAWAI = 'PEGAWAI'
}

export enum AccountStatus {
  ACTIVE = 'Aktif',
  LOCKED = 'Terkunci',
  MUST_CHANGE = 'Wajib Ganti Password'
}

export type ActivityType = 'Daring' | 'Luring';
export type FundingType = 'Tanpa Biaya' | 'Biaya BPMP' | 'Biaya Penyelenggara';

export interface ResetLog {
  targetName: string;
  targetNip: string;
  adminName: string;
  timestamp: string;
  reason: string;
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
  accountStatus?: AccountStatus;
  lastReset?: string;
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
  activityType?: ActivityType;
  fundingType?: FundingType;
  reportStatus?: ReportStatus;
  reportDate?: string;
  reportSummary?: string; 
  reportCreatorNip?: string;
  reportDetails?: ReportDetails;
  reportFileUrl?: string;
  documentationPhotos?: string[];
}

export type Page = 'login' | 'dashboard' | 'employees' | 'calendar' | 'unassigned' | 'form' | 'preview' | 'discipline' | 'reports' | 'reset-password' | 'recap';
