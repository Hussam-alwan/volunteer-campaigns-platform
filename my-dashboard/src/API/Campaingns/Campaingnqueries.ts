// src/apis/campaign/campaign.queries.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import campaignApis from "./Campaign.apis"; // استدعاء ملف الـ API الذي جهزناه سوياً
import type { IPagination, IResponse } from "../../common.interfaces";
import type {
  ICampaign,
  ICampaignInputs,
  ICampaignPage,
} from "./Campaign.interfaces"; // استخدم الـ interface الصحيح من Campaign.interfaces

type CampaignListCache =
  | ICampaign[]
  | ICampaignPage
  | (IResponse<ICampaign[]> & {
      content?: ICampaign[];
      last?: boolean;
    });

type CampaignMutationResponse = Partial<ICampaign> & {
  id?: number;
  campaignId?: number;
  categoryId?: number;
  start_date?: string;
  end_date?: string;
  max_volunteers?: number;
  publishedAt?: string | null;
  managedBy?: number | null;
};

const getCampaignItems = (
  cache: CampaignListCache | undefined,
): ICampaign[] => {
  if (!cache) return [];
  if (Array.isArray(cache)) return cache;
  const obj = cache as { content?: ICampaign[]; data?: ICampaign[] };
  if (Array.isArray(obj.content)) return obj.content;
  if (Array.isArray(obj.data)) return obj.data;
  return [];
};

// تجميع مفاتيح الكاش (Query Keys) لضمان تنظيمها وعدم تكرارها
export const campaignQueryKeys = {
  useGetAllCampaigns: (param: IPagination) =>
    ["get-all-campaigns", param] as const,
  useGetCampaignById: (id: number) => ["get-campaign-by-id", id] as const,
};

// 1. هوك جلب كل الحملات مع الـ Pagination والـ Filters
// نُبقي على الرد الكامل (content + totalPages) حتى تعمل أزرار الترقيم في الواجهة
const useGetAllCampaigns = (param?: any) => {
  const queryResult = useQuery<CampaignListCache, Error>({
    queryKey: campaignQueryKeys.useGetAllCampaigns(param),
    queryFn: () => campaignApis.getAllCampaigns(param),
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

// 3. هوك إضافة حملة جديدة مع تحديث الـ cache تلقائياً
const useAddCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICampaignInputs) => campaignApis.addCampaign(payload),
    onSuccess: (responseData: CampaignMutationResponse) => {
      console.log("📋 Response from API:", responseData);

      // استخرج الحملة الجديدة من الـ response وتأكد من وجود جميع الحقول
      const newCampaign: ICampaign = {
        campaignId: responseData.campaignId || responseData.id || Date.now(),
        title: responseData.title || "",
        description: responseData.description || "",
        location: responseData.location || "",
        startDate: responseData.startDate || responseData.start_date || "",
        endDate: responseData.endDate || responseData.end_date || "",
        maxVolunteers:
          responseData.maxVolunteers || responseData.max_volunteers || 0,
        status: responseData.status || "PENDING",
        publishedAt: responseData.publishedAt || null,
        createdAt: responseData.createdAt || new Date().toISOString(),
        updatedAt: responseData.updatedAt || new Date().toISOString(),
        proposedBy: responseData.proposedBy || 0,
        approvedBy: responseData.approvedBy || null,
        managedBy: responseData.managedBy || 0,
        category: responseData.category || responseData.categoryId || 0,
        photos: [],
      };

      console.log("✅ New Campaign Object:", newCampaign);

      const queryKey = ["get-all-campaigns"] as const;

      // حاول تحديث الكاش أولاً (لتحسين الاستجابة الفورية)
      try {
        queryClient.setQueriesData<CampaignListCache>(
          { queryKey },
          (oldData) => {
            if (!oldData) {
              const freshContent = [newCampaign];
              return {
                content: freshContent,
                data: freshContent,
                totalElements: 1,
                totalPages: 1,
                last: true,
              };
            }

            const currentContent = getCampaignItems(oldData);
            const updatedContent = [newCampaign, ...currentContent];

            if (Array.isArray(oldData)) {
              return updatedContent;
            }

            return {
              ...oldData,
              content: updatedContent,
              data: updatedContent,
              totalElements:
                (oldData.totalElements ?? currentContent.length) + 1,
            };
          },
        );
      } catch (e: unknown) {
        console.warn("Cache update warning:", e);
      }
    },
    onError: (error: unknown) => {
      console.error("❌ Mutation error:", error);
    },
  });
};

// 4. هوك حذف حملة مع تحديث الـ cache
const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: number) => campaignApis.deleteCampaign(campaignId),
    onSuccess: (_, campaignId: number) => {
      console.log("✅ Campaign deleted:", campaignId);

      const queryKey = ["get-all-campaigns"] as const;

      // حدّث الكاش بحذف الحملة من القائمة
      try {
        queryClient.setQueriesData<CampaignListCache>(
          { queryKey },
          (oldData) => {
            if (!oldData) return oldData;

            const filteredContent = getCampaignItems(oldData).filter(
              (campaign) => campaign.campaignId !== campaignId,
            );

            if (Array.isArray(oldData)) {
              return filteredContent;
            }

            return {
              ...oldData,
              content: filteredContent,
              data: filteredContent,
              totalElements: Math.max(0, (oldData.totalElements || 1) - 1),
            };
          },
        );
      } catch (e: unknown) {
        console.warn("Cache update warning:", e);
      }
    },
    onError: (error: unknown) => {
      console.error("❌ Delete mutation error:", error);
    },
  });
};

// 5. هوك تعديل حملة (يُستخدم لتغيير الحالة Status أو أي تعديل كامل)
const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ICampaignInputs }) =>
      campaignApis.updateCampaign(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-all-campaigns"],
        exact: false,
      });
    },
    onError: (error: unknown) => {
      console.error("❌ Update mutation error:", error);
    },
  });
};

const campaignQueries = {
  useGetAllCampaigns,
  useGetCampaignById,
  useAddCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
};

export default campaignQueries;
