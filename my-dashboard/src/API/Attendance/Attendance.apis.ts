import ApiInstance from "../api.instance";
import type { IPagination } from "../../common.interfaces";
import AttendanceApiRoutes from "./Attendance.api-routes";
import useAuthStore from "../../store/auth.store";
import type {
  IAttendance,
  IAttendanceInput,
  IAttendancePage,
  IProgress,
  IProgressPage,
} from "./Attendance.interfaces";

const currentUserId = (): number => {
  const user = useAuthStore.getState().user;
  if (!user?.userId) {
    throw new Error("Not authenticated.");
  }
  return user.userId;
};

const getAttendance = async (
  campaignId: number | string,
  params?: IPagination,
): Promise<IAttendancePage> => {
  const { data } = await ApiInstance.get<IAttendancePage>(
    AttendanceApiRoutes.GetAttendance(campaignId),
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 100,
      },
    },
  );
  return data;
};

const createAttendance = async (
  campaignId: number | string,
  payload: IAttendanceInput,
): Promise<IAttendance> => {
  const { data } = await ApiInstance.post<IAttendance>(
    AttendanceApiRoutes.CreateAttendance(campaignId),
    { ...payload, recordedBy: currentUserId() },
  );
  return data;
};

const createAttendanceBulk = async (
  campaignId: number | string,
  payloads: IAttendanceInput[],
): Promise<IAttendance[]> => {
  const recordedBy = currentUserId();
  const { data } = await ApiInstance.post<IAttendance[]>(
    AttendanceApiRoutes.CreateAttendanceBulk(campaignId),
    payloads.map((p) => ({ ...p, recordedBy })),
  );
  return data;
};

const getProgress = async (
  campaignId: number | string,
  params?: IPagination,
): Promise<IProgressPage> => {
  const { data } = await ApiInstance.get<IProgressPage>(
    AttendanceApiRoutes.GetProgress(campaignId),
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 100,
      },
    },
  );
  return data;
};

const createProgress = async (
  campaignId: number,
  percentage: number,
  notes?: string,
): Promise<IProgress> => {
  const { data } = await ApiInstance.post<IProgress>(
    AttendanceApiRoutes.CreateProgress(campaignId),
    {
      percentage,
      notes,
      campaign: campaignId,
      updatedBy: currentUserId(),
    },
  );
  return data;
};

const attendanceApis = {
  getAttendance,
  createAttendance,
  createAttendanceBulk,
  getProgress,
  createProgress,
};

export default attendanceApis;
