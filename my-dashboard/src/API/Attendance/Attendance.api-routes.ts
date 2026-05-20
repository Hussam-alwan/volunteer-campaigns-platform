const AttendanceApiRoutes = {
  // روابط الحضور والغياب (Attendance) - حذفنا /api/v1 من البداية
  GetAttendance: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance`,
  CreateAttendance: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance`,
  CreateAttendanceBulk: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance/bulk`,

  // روابط التقدم (Progress) - حذفنا /api/v1 من البداية
  GetProgress: (campaignId: number | string) =>
    `/campaigns/${campaignId}/progress`,
  CreateProgress: (campaignId: number | string) =>
    `/campaigns/${campaignId}/progress`,
};

export default AttendanceApiRoutes;
