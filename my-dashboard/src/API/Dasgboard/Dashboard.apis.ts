import ApiInstance from "@/API/api.instance";
import campaignApis from "@/API/Campaingns/Campaign.apis";
import attendanceApis from "@/API/Attendance/Attendance.apis";
import useAuthStore, { $AuthStoreKey } from "@/store/auth.store";
import type { IDashboardSummary } from "./Dashboard.interfaces";
import type { AxiosError } from "axios";

interface BackendDashboardStats {
  totalStudents: number;
  activeCampaigns: number;
  colleges: number;
  avgAttendance: number;
  studentsPerCollege: { collegeId: number; collegeName: string; studentCount: number }[];
  applicationStatusCounts: Record<string, number>;
}

const unauthorized = () =>
  Object.assign(new Error("Unauthorized"), { isAuth: true });

const hasAuthToken = (): boolean => {
  if (useAuthStore.getState().token) return true;
  const persisted = localStorage.getItem($AuthStoreKey);
  if (!persisted) return false;
  try {
    const parsed = JSON.parse(persisted) as { state?: { token?: string } };
    return Boolean(parsed?.state?.token);
  } catch {
    return false;
  }
};

export const getDashboardSummary = async (): Promise<IDashboardSummary> => {
  if (!hasAuthToken()) throw unauthorized();

  try {
    const { data } = await ApiInstance.get<BackendDashboardStats>(
      "/dashboard/stats",
    );
    const counts = data.applicationStatusCounts || {};
    const approved = counts.APPROVED || 0;
    const pending = counts.PENDING || 0;
    const rejected = counts.REJECTED || 0;
    const withdrawn = counts.WITHDRAWN || 0;

    return {
      activeCampaigns: data.activeCampaigns || 0,
      totalApplications: approved + pending + rejected + withdrawn,
      totalVolunteers: data.totalStudents || 0,
      byStatus: { approved, pending, rejected, withdrawn },
    };
  } catch (err) {
    if ((err as AxiosError)?.response?.status === 401) throw unauthorized();
    throw err;
  }
};

const getAttendanceChartData = async () => {
  try {
    const campaigns = await campaignApis.getAllCampaigns({ page: 0, size: 20 });
    const list = campaigns.content || [];
    if (list.length === 0) return [];

    const rows = await Promise.all(
      list.map(async (camp) => {
        try {
          const resp = await attendanceApis.getProgress(camp.id, {
            page: 0,
            size: 50,
          });
          const items = resp.content ?? [];
          const latest = items.reduce(
            (best, p) =>
              !best || new Date(p.createdAt) > new Date(best.createdAt)
                ? p
                : best,
            null as null | (typeof items)[number],
          );
          return {
            name:
              camp.title.length > 14
                ? camp.title.slice(0, 14) + "…"
                : camp.title,
            percentage: latest?.percentage ?? 0,
          };
        } catch {
          return { name: camp.title.slice(0, 14), percentage: 0 };
        }
      }),
    );

    return rows;
  } catch (err) {
    if ((err as AxiosError)?.response?.status === 401) throw unauthorized();
    return [];
  }
};

export default { getDashboardSummary, getAttendanceChartData };
