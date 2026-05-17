// src/apis/common.interfaces.ts

// 1. غلاف الرد الموحد القادم من السيرفر (API Response Wrapper)
export interface IResponse<T> {
  data: T; // البيانات الفعلية (مثل مصفوفة الحملات)
  status?: number; // كود الحالة (اختياري مثل 200 أو 201)
  message?: string; // رسالة نجاح أو خطأ من السيرفر (اختياري)

  // إذا كان السيرفر يرسل الـ Pagination مباشرة في جذر الرد:
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
}

// 2. البارامترات التي نرسلها من الـ Frontend عند طلب صفحة معينة (Query Params)
export interface IPagination {
  page?: number; // رقم الصفحة المطلوبة (يبدأ عادةً من 0 أو 1 حسب الباك إند)
  size?: number; // عدد العناصر في الصفحة الواحدة (استبدلنا perPage بـ size لأنها الأسهل لـ Spring Boot)
  keyword?: string; // ميزة إضافية: إذا كنتِ تريدين عمل بحث (Search) بنفس الطلب
}
