import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import attendanceApis from "./Attendance.apis";
import type { IPagination } from "../../common.interfaces";
import type {
  IAttendanceInputs,
  IBulkAttendanceInputs,
  IProgressInputs,
} from "./Attendance.interfaces";

export const attendanceQueryKeys = {
  useGetAttendance: (campaignId: number | string, param?: IPagination) =>
    ["get-attendance", campaignId, param] as const,
  useGetProgress: (campaignId: number | string, param?: IPagination) =>
    ["get-progress", campaignId, param] as const,
};

// 1. هوك جلب سجل الحضور والغياب
const useGetAttendance = (campaignId: number | string, param?: IPagination) => {
  return useQuery({
    queryKey: attendanceQueryKeys.useGetAttendance(campaignId, param),
    queryFn: () => attendanceApis.getAttendance(campaignId, param),
    enabled: !!campaignId && campaignId !== 0,
  });
};

// 2. هوك جلب سجلات التقدم
const useGetProgress = (campaignId: number | string, param?: IPagination) => {
  return useQuery({
    queryKey: attendanceQueryKeys.useGetProgress(campaignId, param),
    queryFn: () => attendanceApis.getProgress(campaignId, param),
    enabled: !!campaignId && campaignId !== 0,
  });
};

// 3. هوك إضافة حضور فردي
export const useCreateAttendance = (campaignId: number | string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IAttendanceInputs) =>
      attendanceApis.createAttendance(campaignId, payload),
    onSuccess: () => {
      // 🔥 التعديل السحري: نمرر المفتاح الرئيسي ونضيف exact: false لتحديث كل الجداول المرتبطة بالحملة فوراً
      queryClient.invalidateQueries({
        queryKey: ["get-attendance", campaignId],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get-progress", campaignId],
        exact: false,
      });
    },
  });
};

// 4. هوك إضافة حضور جماعي Bulk
const useCreateAttendanceBulk = (campaignId: number | string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IBulkAttendanceInputs) =>
      attendanceApis.createAttendanceBulk(campaignId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-attendance", campaignId],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get-progress", campaignId],
        exact: false,
      });
    },
  });
};

// 5. هوك تعديل الحضور
export const useUpdateAttendance = (campaignId: number | string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: IAttendanceInputs;
    }) => attendanceApis.updateAttendance(campaignId, id, payload),
    onSuccess: () => {
      // 🔥 التعديل السحري: إجبار الـ React Query على تحديث الكاش حتى لو كان يحتوي على params أو pagination
      queryClient.invalidateQueries({
        queryKey: ["get-attendance", campaignId],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get-progress", campaignId],
        exact: false,
      });
    },
  });
};

// 6. هوك إضافة سجل تقدّم لحملة (غير مرتبط بـ campaignId ثابت ليُستخدم من جدول الحملات)
export const useCreateProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: number;
      payload: IProgressInputs;
    }) => attendanceApis.createProgress(campaignId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["get-progress", variables.campaignId],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get-all-campaigns"],
        exact: false,
      });
    },
  });
};

const attendanceQueries = {
  useGetAttendance,
  useGetProgress,
  useCreateAttendance,
  useCreateAttendanceBulk,
  useUpdateAttendance,
  useCreateProgress,
};

export default attendanceQueries;
