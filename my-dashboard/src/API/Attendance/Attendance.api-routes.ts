const AttendanceApiRoutes = {
  // روابط الحضور والغياب (Attendance)
  GetAttendance: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance`,
  CreateAttendance: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance`,
  CreateAttendanceBulk: (campaignId: number | string) =>
    `/campaigns/${campaignId}/attendance/bulk`,
  GetProgress: (campaignId: number | string) =>
    `/campaigns/${campaignId}/progress`,
  CreateProgress: (campaignId: number | string) =>
    `/campaigns/${campaignId}/progress`,
};

export default AttendanceApiRoutes;
