// src/interfaces/Colleges.interfaces.ts

export interface ICollege {
  collegeId: number;
  name: string;
  description: string;
  createdAt: string; // أو Date حسب رغبتك بالمعالجة
  updatedAt: string;
}

// الواجهة الخاصة ببيانات الإنشاء (بدون ID وبدون تواريخ لتجنب خطأ 500)
export interface ICreateCollegeInput {
  name: string;
  description: string;
}

// الواجهة الخاصة بالتعديل (بحال كان التعديل مطابقاً للإنشاء)
export interface IUpdateCollegeInput {
  name: string;
  description: string;
}

// واجهة الـ Query Params لإرسالها بالـ Request
export interface IPageableParams {
  page: number;
  size: number;
  sort?: string | string[]; // جعلناها مرنة لتوافق صيغة (name,asc)
}

// واجهة الـ pageable الداخلية التي يعيدها الباك-إيند في الـ Response
export interface SpringPageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

// الرد الكامل والنهائي المتوقع من الـ GET /api/v1/colleges بناءً على Spring Data
export interface ICollegesPaginatedResponse {
  content: ICollege[];
  pageable: SpringPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
