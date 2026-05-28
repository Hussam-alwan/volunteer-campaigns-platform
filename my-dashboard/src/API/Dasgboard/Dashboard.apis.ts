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
    // const r = res as IResponse<ICampaign[]>;
    const r: IResponse<ICampaign[]> = {
      data: res.content,
    };
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
    const resp = await ApiInstance.get("/users", {
      params: { page: 0, size: 1 },
    });

    return (
      resp.data?.totalElements ??
      resp.data?.content?.length ??
      resp.data?.length ??
      0
    );
  } catch (err: unknown) {
    const status = (err as AxiosError)?.response?.status;
    if (status === 401)
      throw Object.assign(new Error("Unauthorized"), { isAuth: true });
    return 0;
  }
};

const getCalendarLabel = async (): Promise<string> => {
  try {
    const res = await campaignApis.getAllCampaigns({ page: 0, size: 100 });
    const campaigns = Array.isArray(
      (res as unknown as { content?: ICampaign[] }).content,
    )
      ? (res as unknown as { content: ICampaign[] }).content
      : Array.isArray((res as unknown as { data?: ICampaign[] }).data)
        ? (res as unknown as { data: ICampaign[] }).data
        : [];

    const latest = campaigns.reduce<ICampaign | null>((best, current) => {
      if (!best) return current;
      return new Date(current.createdAt).getTime() >=
        new Date(best.createdAt).getTime()
        ? current
        : best;
    }, null);

    if (!latest?.createdAt) return "This Month";

    return new Date(latest.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch (err: unknown) {
    const status = (err as AxiosError)?.response?.status;
    if (status === 401)
      throw Object.assign(new Error("Unauthorized"), { isAuth: true });
    return "This Month";
  }
};

const hasAuthToken = (): boolean => {
  const tokenInStore = useAuthStore.getState();
  // .token

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
    const res = await campaignApis.getAllCampaigns({
      page: 0,
      size: 100,
    });

    const campaigns = Array.isArray(
      (res as unknown as { content?: ICampaign[] }).content,
    )
      ? (res as unknown as { content: ICampaign[] }).content
      : Array.isArray((res as unknown as { data?: ICampaign[] }).data)
        ? (res as unknown as { data: ICampaign[] }).data
        : [];

    const firstId = campaigns?.[0]?.campaignId ?? null;
    if (!firstId) return [];

    const progressResp = await attendanceApis.getProgress(firstId, {
      page: 0,
      size: 100,
    });

    const items = Array.isArray(
      (progressResp as unknown as { data?: IProgress[] }).data,
    )
      ? (progressResp as unknown as { data: IProgress[] }).data
      : Array.isArray(
            (progressResp as unknown as { content?: IProgress[] }).content,
          )
        ? (progressResp as unknown as { content: IProgress[] }).content
        : [];

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

export default {
  getDashboardSummary,
  getAttendanceChartData,
  getCalendarLabel,
};
