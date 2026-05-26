export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  EXCUSED: "EXCUSED",
  LATE: "LATE",
} as const;

export type TAttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface IAttendance {
  attendanceId: number;
  attendanceDate: string;
  status: TAttendanceStatus;
  hoursThatDay: number;
  notes: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  student: number;
  studentName: string;
  campaign: number;
  recordedBy: number;
  recordedByName: string;
}

export interface IProgress {
  progressId: number;
  percentage: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  campaign: number;
  updatedBy: number;
}

export interface IAttendanceInput {
  attendanceDate: string;
  status: TAttendanceStatus;
  hoursThatDay: number;
  notes?: string;
  student: number;
}

export interface IAttendancePage {
  content: IAttendance[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface IProgressPage {
  content: IProgress[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
