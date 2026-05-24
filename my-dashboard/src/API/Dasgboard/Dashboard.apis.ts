import ApiInstance from "@/API/api.instance";
import campaignApis from "@/API/Campaingns/Campaign.apis";
import attendanceApis from "@/API/Attendance/Attendance.apis";
import useAuthStore, { $AuthStoreKey } from "@/store/auth.store";
import type { IDashboardSummary } from "./Dashboard.interfaces";
import type { AxiosError } from "axios";
import type { IResponse } from "@/common.interfaces";
import type { ICampaign } from "@/API/Campaingns/Campaign.interfaces";
import type { IProgress } from "@/API/Attendance/Attendance.interfaces";

const getApplicationsCount = async (status?: string) => {
  try {
    const params: Record<string, unknown> = { size: 1 };
    if (status) (params as Record<string, unknown>)["status"] = status;
    const resp = await ApiInstance.get("/applications", { params });
    return resp.data?.totalElements ?? 0;
  } catch (err: unknown) {
    const status = (err as AxiosError)?.response?.status;
    if (status === 401)
      throw Object.assign(new Error("Unauthorized"), { isAuth: true });
    return 0;
  }
};

const getCampaignsCount = async () => {
  try {
    const res = await campaignApis.getAllCampaigns({ page: 0, size: 1 });
    const r = res as IResponse<ICampaign[]>;
    const total =
      typeof r.totalElements === "number"
        ? r.totalElements
        : Array.isArray(r.data)
          ? r.data.length
          : 0;
    return total || 0;
  } catch (err: unknown) {
    const status = (err as AxiosError)?.response?.status;
    if (status === 401)
      throw Object.assign(new Error("Unauthorized"), { isAuth: true });
    return 0;
  }
};

const getVolunteersCount = async () => {
  try {
    const resp = await ApiInstance.get("/students", { params: { size: 1 } });
    return resp.data?.totalElements ?? 0;
  } catch (err: unknown) {
    const status = (err as AxiosError)?.response?.status;
    if (status === 401)
      throw Object.assign(new Error("Unauthorized"), { isAuth: true });
    return 0;
  }
};

const hasAuthToken = (): boolean => {
  const tokenInStore = useAuthStore.getState().token;
  if (tokenInStore) return true;

  const persisted = localStorage.getItem($AuthStoreKey);
  if (!persisted) return false;

  try {
    const parsed = JSON.parse(persisted) as { state?: { token?: string } };
    return Boolean(parsed?.state?.token);
  } catch {
    return false;
  }
};

const getAttendanceChartData = async () => {
  try {
    const campaigns = (await campaignApis.getAllCampaigns({
      page: 0,
      size: 1,
    })) as IResponse<ICampaign[]>;
    const firstId = campaigns?.data?.[0]?.campaignId ?? null;
    if (!firstId) return [];

    const progressResp = (await attendanceApis.getProgress(firstId, {
      page: 0,
      size: 100,
    })) as IResponse<IProgress[]>;
    const items = progressResp?.data ?? [];

    const mapped = items
      .map((p) => ({
        name: new Date(p.createdAt).toLocaleDateString(),
        percentage: p.percentage,
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    return mapped;
  } catch (err: unknown) {
    const status = (err as AxiosError)?.response?.status;
    if (status === 401)
      throw Object.assign(new Error("Unauthorized"), { isAuth: true });
    return [];
  }
};

export const getDashboardSummary = async (): Promise<IDashboardSummary> => {
  if (!hasAuthToken())
    throw Object.assign(new Error("Unauthorized"), { isAuth: true });

  const [
    activeCampaigns,
    totalApplications,
    approved,
    pending,
    rejected,
    withdrawn,
    volunteers,
  ] = await Promise.all([
    getCampaignsCount(),
    getApplicationsCount(),
    getApplicationsCount("APPROVED"),
    getApplicationsCount("PENDING"),
    getApplicationsCount("REJECTED"),
    getApplicationsCount("WITHDRAWN"),
    getVolunteersCount(),
  ]);

  return {
    activeCampaigns,
    totalApplications,
    totalVolunteers: volunteers,
    byStatus: {
      approved,
      pending,
      rejected,
      withdrawn,
    },
  };
};

export default { getDashboardSummary, getAttendanceChartData };
