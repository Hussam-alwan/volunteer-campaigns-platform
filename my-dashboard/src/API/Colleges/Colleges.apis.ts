// src/apis/college/Colleges.apis.ts

import ApiInstance from "../api.instance"; // نفس كليينت الـ Axios المستخدم في الـ campaigns
import CollegesApiRoutes from "./Colleges.api-routes"; // ملف الـ Routes الخاص بالكليات
import type {
  ICollege,
  ICreateCollegeInput,
  IUpdateCollegeInput,
  IPageableParams,
  ICollegesPaginatedResponse,
} from "./Colleges.interfaces";

// 1. جلب كل الكليات مع الـ Pagination والـ Params (تجنباً لمشاكل الـ sort)
const getAllColleges = async (params?: IPageableParams) => {
  const { data } = await ApiInstance.get<ICollegesPaginatedResponse>(
    CollegesApiRoutes.GetAll,
    {
      params,
    },
  );
  return data;
};

// 2. جلب كلية واحدة محددة عبر الـ ID
const getCollege = async (id: number) => {
  const { data } = await ApiInstance.get<ICollege>(
    `${CollegesApiRoutes.GetAll}/${id}`,
  );
  return data;
};

// 3. إضافة كلية جديدة (مع تجنب إرسال الـ ID لمنع خطأ الـ ILLEGAL_ARGUMENT)
const addCollege = async (payload: ICreateCollegeInput) => {
  const { data } = await ApiInstance.post<ICollege>(
    CollegesApiRoutes.GetAll,
    payload,
  );
  return data;
};

// 4. تعديل كلية كاملة عبر الـ PUT والـ ID
const updateCollege = async (payload: IUpdateCollegeInput, id: number) => {
  const { data } = await ApiInstance.put<ICollege>(
    `${CollegesApiRoutes.GetAll}/${id}`,
    payload,
  );
  return data;
};

// 5. حذف كلية نهائياً
const deleteCollege = async (id: number) => {
  const { data } = await ApiInstance.delete(
    `${CollegesApiRoutes.GetAll}/${id}`,
  );
  return data;
};

// تجميع كل الدوال لتصديرها بشكل منظم ومطابق لأسلوب الـ campaigns
const collegesApis = {
  getAllColleges,
  getCollege,
  addCollege,
  updateCollege,
  deleteCollege,
};

export default collegesApis;
