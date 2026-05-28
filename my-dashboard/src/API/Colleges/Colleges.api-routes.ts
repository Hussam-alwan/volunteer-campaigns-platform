// src/constants/collegesRoutes.ts

const CollegesApiRoutes = {
  GetAll: "/colleges", // السلاش بالبداية ضروري هنا
  GetById: (id: number) => `/colleges/${id}`,
  Update: (id: number) => `/colleges/${id}`,
  Delete: (id: number) => `/colleges/${id}`,
};

export default CollegesApiRoutes;
