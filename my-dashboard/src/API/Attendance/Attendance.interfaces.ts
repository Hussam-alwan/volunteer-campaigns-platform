export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
} as const;

export type TAttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

// 1. الـ Response الراجع من السيرفر (كامل وجاهز)
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

// 2. الـ Inputs المطلوبة عند الإرسال (POST / PUT) 🔥
export interface IAttendanceInputs {
  attendanceDate: string; // صيغة "YYYY-MM-DD"
  status: TAttendanceStatus;
  hoursThatDay: number;
  notes?: string;
  student: number; // ID الطالب مباشرة
  recordedBy: number; // ID المشرف/المستخدم الحالي (مهم جداً للسواغر) 🌟
}

export interface IProgressInputs {
  percentage: number;
  notes?: string;
  campaign: number; // من السواغر: يحتاج ID الحملة بالـ Body أيضاً بالـ POST
  updatedBy: number; // من السواغر: يحتاج ID المستخدم بالـ Body
}

// 3. كائن الـ Bulk (عبارة عن Array من العناصر السابقة)
export type IBulkAttendanceInputs = IAttendanceInputs[];
