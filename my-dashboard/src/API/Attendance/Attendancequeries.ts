import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import attendanceApis from "./Attendance.apis";
import type { IPagination } from "../../common.interfaces";
import type { IAttendanceInput } from "./Attendance.interfaces";

export const attendanceQueryKeys = {
  attendance: (campaignId: number | string) =>
    ["attendance", campaignId] as const,
  progress: (campaignId: number | string) => ["progress", campaignId] as const,
};

const useGetAttendance = (
  campaignId: number | string,
  param?: IPagination,
) =>
  useQuery({
    queryKey: [...attendanceQueryKeys.attendance(campaignId), param],
    queryFn: () => attendanceApis.getAttendance(campaignId, param),
    enabled: !!campaignId,
  });

const useGetProgress = (campaignId: number | string, param?: IPagination) =>
  useQuery({
    queryKey: [...attendanceQueryKeys.progress(campaignId), param],
    queryFn: () => attendanceApis.getProgress(campaignId, param),
    enabled: !!campaignId,
  });

const useCreateAttendance = (campaignId: number | string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IAttendanceInput) =>
      attendanceApis.createAttendance(campaignId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: attendanceQueryKeys.attendance(campaignId),
      });
      qc.invalidateQueries({
        queryKey: attendanceQueryKeys.progress(campaignId),
      });
    },
  });
};

const useCreateAttendanceBulk = (campaignId: number | string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payloads: IAttendanceInput[]) =>
      attendanceApis.createAttendanceBulk(campaignId, payloads),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: attendanceQueryKeys.attendance(campaignId),
      });
    },
  });
};

const useCreateProgress = (campaignId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ percentage, notes }: { percentage: number; notes?: string }) =>
      attendanceApis.createProgress(campaignId, percentage, notes),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: attendanceQueryKeys.progress(campaignId),
      });
    },
  });
};

const attendanceQueries = {
  useGetAttendance,
  useGetProgress,
  useCreateAttendance,
  useCreateAttendanceBulk,
  useCreateProgress,
};

export default attendanceQueries;
