// src/apis/college/Colleges.queries.ts

import { useQuery } from "@tanstack/react-query";
import collegesApis from "./Colleges.apis"; // استدعاء ملف الـ API الخاص بالكليات الذي جهزناه
import type { IPageableParams } from "./Colleges.interfaces";

// تجميع مفاتيح الكاش (Query Keys) لضمان تنظيمها وعدم تكرارها للكليات
export const collegesQueryKeys = {
  useGetAllColleges: (param: IPageableParams) =>
    ["get-all-colleges", param] as const,
  useGetCollegeById: (id: number) => ["get-college-by-id", id] as const,
};

// 1. هوك جلب كل الكليات مع الـ Pagination والـ Filters
const useGetAllColleges = (param: IPageableParams) => {
  const queryResult = useQuery({
    queryKey: collegesQueryKeys.useGetAllColleges(param),
    queryFn: () => collegesApis.getAllColleges(param),
    select: (res) => res,
  });

  return queryResult;
};

// 2. هوك جلب كلية واحدة محددة عبر الـ ID
const useGetCollegeById = (collegeId: number) => {
  const queryResult = useQuery({
    queryKey: collegesQueryKeys.useGetCollegeById(collegeId),
    queryFn: () => collegesApis.getCollege(collegeId),
    select: (res) => res,
    // الـ Hook لن يعمل إلا إذا كان الـ ID متاحاً وموجوداً (يمنع طلب قيم صفرية أو undefined)
    enabled: !!collegeId && collegeId !== 0,
  });

  return queryResult;
};

const collegesQueries = {
  useGetAllColleges,
  useGetCollegeById,
};

export default collegesQueries;
