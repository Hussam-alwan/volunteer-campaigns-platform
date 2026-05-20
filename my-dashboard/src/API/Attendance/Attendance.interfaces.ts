import { TAutoComplete } from "hooks/use-generic-form/types";

// 1. القيمة (Value) المستعملة داخل الكود والمقارنات
export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
} as const;

// 2. النوع (Type) الصحيح المتوافق مع erasableSyntaxOnly
export type TAttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

// 3. واجهة الحضور والغياب (Response القادم من السيرفر)
export interface IAttendance {
  attendanceId: number;
  attendanceDate: string;
  status: TAttendanceStatus; // استخدام التايب الصحيح هنا
  hoursThatDay: number;
  notes: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  student: number;
  campaign: number;
  recordedBy: number;
}

// 4. واجهة التقدم (Progress Response)
export interface IProgress {
  progressId: number;
  percentage: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  campaign: number;
  updatedBy: number;
}

// 5. واجهة البيانات المدخلة في الفورم لإنشاء حضور (Attendance Inputs)
export interface IAttendanceInputs {
  attendanceDate: string;
  status: TAttendanceStatus; // استخدام التايب الصحيح هنا
  hoursThatDay: number;
  notes?: string;
  student: TAutoComplete | null;
}

// 6. واجهة البيانات المدخلة في الفورم لإنشاء تقدم جديد (Progress Inputs)
export interface IProgressInputs {
  percentage: number;
  notes?: string;
}

// 7. واجهة الـ Bulk Attendance
export interface IBulkAttendanceInputs {
  attendanceDate: string;
  status: TAttendanceStatus; // استخدام التايب الصحيح هنا
  hoursThatDay: number;
  notes?: string;
  studentIds: number[];
}
