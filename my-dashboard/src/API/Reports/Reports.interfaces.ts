// src/API/Reports/Reports.interfaces.ts

// ==========================================
// 1. Dashboard Stats Interfaces (إحصائيات الداشبورد)
// ==========================================
export interface IStudentsPerCollege {
  collegeId: number;
  collegeName: string;
  studentCount: number;
}

export interface IApplicationStatusCounts {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  CANCELLED: number;
  WITHDRAWN: number;
  [key: string]: number; // لدعم أي حالة إضافية مرسلة من الباك-إيند
}

export interface IDashboardStatsResponse {
  totalStudents: number;
  activeCampaigns: number;
  colleges: number;
  avgAttendance: number;
  studentsPerCollege: IStudentsPerCollege[];
  applicationStatusCounts: IApplicationStatusCounts;
}

// ==========================================
// 2. Campaign Progress Interfaces (تقدم الحملات)
// ==========================================
export interface ICampaignProgress {
  progressId: number;
  percentage: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  campaign: number; // عبارة عن ID الحملة
  updatedBy: number; // عبارة عن ID المستخدم
}

// واجهة الإنشاء (POST) لتقدم الحملة حسب الـ Request Body في السواغر
export interface ICreateCampaignProgressInput {
  percentage: number;
  notes: string;
  campaign: number;
  updatedBy: number;
}

// ==========================================
// 3. Campaign Attendance Interfaces (حضور وغياب الطلاب)
// ==========================================
export interface ICampaignAttendance {
  attendanceId: number;
  attendanceDate: string; // صيغة YYYY-MM-DD
  status: "PRESENT" | "ABSENT" | string; // حسب الـ Enum بالباك-إيند
  hoursThatDay: number;
  notes: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  student: number;
  studentName: string;
  campaign: number;
  recordedBy: number;
  recordedByName: string;
}

// واجهة الإنشاء (POST) للتحضير المفرد
export interface ICreateCampaignAttendanceInput {
  attendanceDate: string;
  status: "PRESENT" | "ABSENT" | string;
  hoursThatDay: number;
  notes: string;
  student: number;
  recordedBy: number;
}

// ==========================================
// 4. Campaign Applications Interfaces (طلبات الالتحاق)
// ==========================================
export interface ICampaignApplication {
  id: number;
  motivationLetter: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "WITHDRAWN"
    | string;
  rejectionReason: string | null;
  adminNotes: string | null;
  appliedAt: string;
  withdrawnAt: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  removalReason: string | null;
  removedAt: string | null;
  student: number;
  campaign: number;
  reviewedBy: number | null;
  removedBy: number | null;
}

// واجهة التقديم على حملة (POST /apply)
export interface IApplyToCampaignInput {
  motivationLetter: string;
  status: string;
  rejectionReason?: string;
  adminNotes?: string;
  appliedAt: string;
  reviewedAt?: string;
  removalReason?: string;
  student: number;
  campaign: number;
  reviewedBy?: number;
  removedBy?: number;
}

// ==========================================
// 5. Spring Boot Pagination Interfaces (الـ Pagination المشترك للريبورت)
// ==========================================
export interface IPageableParams {
  page: number;
  size: number;
  sort?: string; // يتم تمريرها كـ string نظيف لتجنب خطأ الـ 500 مثل "createdAt,desc"
}

export interface SpringPageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

// واجهات الاستجابة المحدثة (Paginated Responses) بناءً على السواغر
export interface ICampaignProgressPaginatedResponse {
  content: ICampaignProgress[];
  pageable: SpringPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ICampaignAttendancePaginatedResponse {
  content: ICampaignAttendance[];
  pageable: SpringPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ICampaignApplicationsPaginatedResponse {
  content: ICampaignApplication[];
  pageable: SpringPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
