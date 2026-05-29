const AttendanceApiRoutes = {
  // روابط الحضور والغياب (Attendance)
  GetAttendance: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance`,
  CreateAttendance: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance`,
  CreateAttendanceBulk: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance/bulk`,
  // نُضيف رابط التعديل هنا لربطه مع الـ Backend 🔥
  UpdateAttendance: (
    campaignId: number | string,
    attendanceId: number | string,
  ) => `/campaigns/${campaignId}/attendance/${attendanceId}`,

  // روابط التقدم (Progress)
  GetProgress: (campaignId: number | string) =>
    `/campaigns/${campaignId}/progress`,
  CreateProgress: (campaignId: number | string) =>
    `/campaigns/${campaignId}/progress`,
};

export default AttendanceApiRoutes;
