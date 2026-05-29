// src/apis/attendance/Attendance.apis.ts

import ApiInstance from "../api.instance";
import type { IPagination, IResponse } from "../../common.interfaces";
import AttendanceApiRoutes from "./Attendance.api-routes";
import type {
  IAttendance,
  IProgress,
  IAttendanceInputs,
  IProgressInputs,
  IBulkAttendanceInputs,
} from "./Attendance.interfaces";

// ==========================================
// 1. دوال الحضور والغياب (Attendance APIs)
// ==========================================

// جلب حضور وغياب حملة معينة مع الـ Pagination والـ Params الافتراضية
const getAttendance = async (
  campaignId: number | string,
  params?: IPagination,
) => {
  const { data } = await ApiInstance.get<IResponse<IAttendance[]>>(
    AttendanceApiRoutes.GetAttendance(campaignId),
    {
      // التعديل: إرسال الـ page و size بشكل صريح ليتوافق مع الـ Pageable الخاص بـ Spring Boot
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 1000, // نطلب 1000 عنصر افتراضياً لضمان ظهور السجلات فوراً
      },
    },
  );
  return data;
};

const updateAttendance = async (
  campaignId: number | string,
  attendanceId: number | string,
  payload: IAttendanceInputs,
) => {
  const { data } = await ApiInstance.put(
    AttendanceApiRoutes.UpdateAttendance(campaignId, attendanceId),
    payload,
  );
  return data;
};

// إنشاء حضور فردي لطالب محدد داخل الحملة
const createAttendance = async (
  campaignId: number | string,
  payload: IAttendanceInputs,
) => {
  const { data } = await ApiInstance.post(
    AttendanceApiRoutes.CreateAttendance(campaignId),
    payload,
  );
  return data;
};

// إنشاء حضور جماعي (Bulk) لمجموعة طلاب داخل الحملة
const createAttendanceBulk = async (
  campaignId: number | string,
  payload: IBulkAttendanceInputs,
) => {
  const { data } = await ApiInstance.post(
    AttendanceApiRoutes.CreateAttendanceBulk(campaignId),
    payload,
  );
  return data;
};

// ==========================================
// 2. دوال التقدم (Progress APIs)
// ==========================================

// جلب سجلات التقدم الخاصة بحملة معينة
const getProgress = async (
  campaignId: number | string,
  params?: IPagination,
) => {
  const { data } = await ApiInstance.get<IResponse<IProgress[]>>(
    AttendanceApiRoutes.GetProgress(campaignId),
    {
      // التعديل: إرسال الـ page و size بشكل صريح ليتوافق مع الـ Pageable الخاص بـ Spring Boot
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 1000,
      },
    },
  );
  return data;
};

// إضافة تقدم جديد للحملة
const createProgress = async (
  campaignId: number | string,
  payload: IProgressInputs,
) => {
  const { data } = await ApiInstance.post(
    AttendanceApiRoutes.CreateProgress(campaignId),
    payload,
  );
  return data;
};

// تجميع كل الدوال لتصديرها بشكل منظم ومطابق لأسلوبك
const attendanceApis = {
  getAttendance,
  createAttendance,
  createAttendanceBulk,
  getProgress,
  createProgress,
  updateAttendance,
};

export default attendanceApis;
