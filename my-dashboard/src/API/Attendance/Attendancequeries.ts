// src/apis/attendance/Attendancequeries.ts

import { useQuery } from "@tanstack/react-query";
import attendanceApis from "./Attendance.apis";
import type { IPagination } from "../../common.interfaces";

// تجميع مفاتيح الكاش (Query Keys) الخاصة بالحضور والتقدم لمنع التكرار
export const attendanceQueryKeys = {
  useGetAttendance: (campaignId: number | string, param?: IPagination) =>
    ["get-attendance", campaignId, param] as const,
  useGetProgress: (campaignId: number | string, param?: IPagination) =>
    ["get-progress", campaignId, param] as const,
};

// 1. هوك جلب سجل الحضور والغياب لحملة معينة
const useGetAttendance = (campaignId: number | string, param?: IPagination) => {
  const queryResult = useQuery({
    queryKey: attendanceQueryKeys.useGetAttendance(campaignId, param),
    queryFn: () => attendanceApis.getAttendance(campaignId, param),
    select: (res) => res,
    // يمنع تشغيل الـ Hook حتى يتوفر الـ Campaign ID
    enabled: !!campaignId && campaignId !== 0,
  });

  return queryResult;
};

// 2. هوك جلب سجلات التقدم لحملة معينة
const useGetProgress = (campaignId: number | string, param?: IPagination) => {
  const queryResult = useQuery({
    queryKey: attendanceQueryKeys.useGetProgress(campaignId, param),
    queryFn: () => attendanceApis.getProgress(campaignId, param),
    select: (res) => res,
    // يمنع تشغيل الـ Hook حتى يتوفر الـ Campaign ID
    enabled: !!campaignId && campaignId !== 0,
  });

  return queryResult;
};

const attendanceQueries = {
  useGetAttendance,
  useGetProgress,
};

export default attendanceQueries;
