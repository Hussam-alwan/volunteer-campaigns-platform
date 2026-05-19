// src/constants/collegesRoutes.ts

const CollegesApiRoutes = {
  GetAll: "/colleges", // للـ GET المدمج مع الـ Pagination والـ POST
  GetById: (id: number) => `/colleges/${id}`, // للـ GET بـ ID واحد
  Update: (id: number) => `/colleges/${id}`, // للـ PUT بالتعديل
  Delete: (id: number) => `/colleges/${id}`, // للـ DELETE بالمسح
};

export default CollegesApiRoutes;
