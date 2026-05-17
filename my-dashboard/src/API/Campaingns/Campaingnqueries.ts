// src/apis/campaign/campaign.queries.ts

import { useQuery } from "@tanstack/react-query";
import campaignApis from "./Campaign.apis"; // استدعاء ملف الـ API الذي جهزناه سوياً
import type { IPagination } from "../../common.interfaces";

// تجميع مفاتيح الكاش (Query Keys) لضمان تنظيمها وعدم تكرارها
export const campaignQueryKeys = {
  useGetAllCampaigns: (param: IPagination) =>
    ["get-all-campaigns", param] as const,
  useGetCampaignById: (id: number) => ["get-campaign-by-id", id] as const,
};

// 1. هوك جلب كل الحملات مع الـ Pagination والـ Filters
const useGetAllCampaigns = (param: IPagination) => {
  const queryResult = useQuery({
    queryKey: campaignQueryKeys.useGetAllCampaigns(param),
    queryFn: () => campaignApis.getAllCampaigns(param),
    // يمكنكِ إبقاء السطر أدناه إذا أردتِ عمل فلترة أو تعديل شكل البيانات قبل وصولها للـ Component
    select: (res) => res,
  });

  return queryResult;
};

// 2. هوك جلب حملة واحدة محددة عبر الـ ID (مثلاً لصفحة تفاصيل الحملة)
const useGetCampaignById = (campaignId: number) => {
  const queryResult = useQuery({
    queryKey: campaignQueryKeys.useGetCampaignById(campaignId),
    queryFn: () => campaignApis.getCampaign(campaignId),
    select: (res) => res,
    // الـ Hook لن يعمل إلا إذا كان الـ ID متاحاً وموجوداً (يمنع طلب قيم صفرية أو undefined)
    enabled: !!campaignId && campaignId !== 0,
  });

  return queryResult;
};

const campaignQueries = {
  useGetAllCampaigns,
  useGetCampaignById,
};

export default campaignQueries;
