// src/API/Reports/Reports.ts

import api from "../api.instance"; // أو حسب اسم ملف الأكسيوس عندك (مثلاً axios.ts)
import ReportsApiRoutes from "./Reports.apis-route";
import type {
  IDashboardStatsResponse,
  ICampaignProgressPaginatedResponse,
  ICampaignAttendancePaginatedResponse,
  ICampaignApplicationsPaginatedResponse,
  IPageableParams,
  ICreateCampaignProgressInput,
} from "./Reports.interfaces";

const ReportsService = {
  // 1. جلب إحصائيات الداشبورد العامة (الكروت والتشارتس)
  getDashboardStats: async (): Promise<IDashboardStatsResponse> => {
    const response = await api.get<IDashboardStatsResponse>(
      ReportsApiRoutes.GetDashboardStats,
    );
    return response.data;
  },

  // 2. جلب تقارير تقدم حملة معينة (مع الـ Pagination والـ Sort الصحيح لحل مشكلة الـ 500)
  getCampaignProgress: async (
    campaignId: number,
    params?: IPageableParams,
  ): Promise<ICampaignProgressPaginatedResponse> => {
    const response = await api.get<ICampaignProgressPaginatedResponse>(
      ReportsApiRoutes.GetCampaignProgress(campaignId),
      {
        params: params
          ? {
              page: params.page,
              size: params.size,
              // إذا لم يتم تمرير ترتيب، نتركها undefined تماماً لتجنب إرسال "string" الخاطئة
              sort: params.sort || undefined,
            }
          : undefined,
      },
    );
    return response.data;
  },

  // 3. إضافة تقرير تقدم جديد لحملة
  createCampaignProgress: async (
    campaignId: number,
    data: ICreateCampaignProgressInput,
  ): Promise<any> => {
    const response = await api.post(
      ReportsApiRoutes.CreateCampaignProgress(campaignId),
      data,
    );
    return response.data;
  },

  // 4. جلب حضور وغياب الطلاب لحملة معينة
  getCampaignAttendance: async (
    campaignId: number,
    params?: IPageableParams,
  ): Promise<ICampaignAttendancePaginatedResponse> => {
    const response = await api.get<ICampaignAttendancePaginatedResponse>(
      ReportsApiRoutes.GetCampaignAttendance(campaignId),
      { params },
    );
    return response.data;
  },

  // 5. جلب طلبات الالتحاق بالحملة والمقبولين
  getCampaignApplications: async (
    campaignId: number,
    params?: IPageableParams,
  ): Promise<ICampaignApplicationsPaginatedResponse> => {
    const response = await api.get<ICampaignApplicationsPaginatedResponse>(
      ReportsApiRoutes.GetCampaignApplications(campaignId),
      { params },
    );
    return response.data;
  },
};

export default ReportsService;
