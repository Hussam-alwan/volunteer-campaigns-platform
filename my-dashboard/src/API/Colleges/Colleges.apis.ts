// src/API/Colleges/Colleges.apis.ts

import ApiInstance from "../axios"; // تأكد من صحة مسار ملف الـ axios عندك
import type {
  ICollege,
  ICreateCollegeInput,
  IUpdateCollegeInput,
  IPageableParams,
  ICollegesPaginatedResponse,
} from "./Colleges.interfaces";

const CollegesApiRoutes = {
  GetAll: "/colleges",
  GetById: (id: number) => `/colleges/${id}`,
  Update: (id: number) => `/colleges/${id}`,
  Delete: (id: number) => `/colleges/${id}`,
};

// 1. جلب الكليات
const getAllColleges = async (params?: IPageableParams) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", (params?.page ?? 0).toString());
  queryParams.append("size", (params?.size ?? 10).toString());

  const { data } = await ApiInstance.get<ICollegesPaginatedResponse>(
    CollegesApiRoutes.GetAll,
    { params: queryParams },
  );
  return data;
};

// 2. إضافة كلية جديدة - تنظيف الـ Payload من الـ ID نهائياً
const addCollege = async (payload: ICreateCollegeInput) => {
  // تفكيك الكائن وحذف الـ collegeId (إذا كان موجوداً بالخطأ بالـ State) لضمان تخطي خطأ 500
  const { collegeId, ...cleanPayload } = payload as any;

  const { data } = await ApiInstance.post<ICollege>(
    CollegesApiRoutes.GetAll,
    cleanPayload, // نرسل البيانات النظيفة بدون الـ ID
  );
  return data;
};

// 3. تعديل كلية كاملة عبر الـ PUT
const updateCollege = async (id: number, payload: IUpdateCollegeInput) => {
  const { data } = await ApiInstance.put<ICollege>(
    CollegesApiRoutes.Update(id),
    payload,
  );
  return data;
};

// 4. حذف كلية نهائياً
const deleteCollege = async (id: number) => {
  const { data } = await ApiInstance.delete(CollegesApiRoutes.Delete(id));
  return data;
};

const collegesApis = {
  getAllColleges,
  addCollege,
  updateCollege,
  deleteCollege,
};

export default collegesApis;
