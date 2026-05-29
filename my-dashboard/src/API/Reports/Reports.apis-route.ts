// src/API/Reports/Reports.api-route.ts

const ReportsApiRoutes = {
  // ==========================================
  // 1. Dashboard Stats (التقارير والإحصائيات العامة)
  // ==========================================
  GetDashboardStats: "/dashboard/stats", // بيرجع أرقام الطلاب، الكليات، نسب الحضور، وحالات الطلبات

  // ==========================================
  // 2. Campaign Progress (تقارير تقدم الحملات)
  // ==========================================
  GetCampaignProgress: (campaignId: number) =>
    `/campaigns/${campaignId}/progress`,
  CreateCampaignProgress: (campaignId: number) =>
    `/campaigns/${campaignId}/progress`,

  GetAllProgresses: "/progresses",
  GetProgressById: (progressId: number) => `/progresses/${progressId}`,

  // ==========================================
  // 3. Campaign Attendance (تقارير حضور وغياب الطلاب بالحملات)
  // ==========================================
  GetCampaignAttendance: (campaignId: number) =>
    `/campaigns/${campaignId}/attendance`,
  CreateCampaignAttendance: (campaignId: number) =>
    `/campaigns/${campaignId}/attendance`,
  CreateBulkAttendance: (campaignId: number) =>
    `/campaigns/${campaignId}/attendance/bulk`, // للتحضير الجماعي

  GetAllAttendances: "/attendances",
  GetAttendanceById: (attendanceId: number) => `/attendances/${attendanceId}`,

  // ==========================================
  // 4. Campaign Applications (تقارير طلبات الالتحاق والمسجلين)
  // ==========================================
  GetCampaignApplications: (campaignId: number) =>
    `/campaigns/${campaignId}/applications`,
  ApplyToCampaign: (campaignId: number) => `/campaigns/${campaignId}/apply`, // الـ POST لتقديم أو مراجعة الطلب
};

export default ReportsApiRoutes;
