// src/apis/campaign/campaign.api.ts

import ApiInstance from "../api.instance"; // تأكدي من مسار ملف الـ Axios الجديد الخاص بكِ
import type { IPagination } from "../../common.interfaces"; // تأكدي من وجود هذه الـ interfaces العامة لديكِ
import CampaignApiRoutes from "./Campaign.api-routes"; // ملف الـ Routes البسيط الذي جهزناه
import type {
  ICampaign,
  ICampaignPage,
  ICampaignInputs,
} from "./Campaign.interfaces"; // الـ Interface الجديد الخاص بالحملات

// 1. جلب كل الحملات مع الـ Pagination والـ Params (رد Spring يكون Page<Campaign>)
const getAllCampaigns = async (params?: IPagination) => {
  const { data } = await ApiInstance.get<ICampaignPage>(
    CampaignApiRoutes.GetAll,
    {
      params,
    },
  );
  return data;
};

// 2. جلب حملة واحدة محددة عبر الـ ID
const getCampaign = async (id: number) => {
  const { data } = await ApiInstance.get<ICampaign>(
    `${CampaignApiRoutes.GetAll}/${id}`,
  );
  return data;
};

// 3. إضافة حملة جديدة (تأخذ payload سواء كان Object عادي أو FormData إذا كان فيه رفع صور)
const addCampaign = async (payload: ICampaignInputs) => {
  const { data } = await ApiInstance.post(CampaignApiRoutes.GetAll, payload);
  return data;
};

// 4. تعديل حملة كاملة (PUT صريح بدون حيلة الـ _method القديمة)
const updateCampaign = async (payload: ICampaignInputs, id: number) => {
  const { data } = await ApiInstance.put(
    `${CampaignApiRoutes.GetAll}/${id}`,
    payload,
  );
  return data;
};

// 5. حذف حملة
const deleteCampaign = async (id: number) => {
  const { data } = await ApiInstance.delete(
    `${CampaignApiRoutes.GetAll}/${id}`,
  );
  return data;
};

// تجميع كل الدوال لتصديرها بشكل منظم
const campaignApis = {
  getAllCampaigns,
  getCampaign,
  addCampaign,
  updateCampaign,
  deleteCampaign,
};

export default campaignApis;
