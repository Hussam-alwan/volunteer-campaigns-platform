// src/interfaces/Colleges.interfaces.ts

export interface ICollege {
  collegeId: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// واجهة الإنشاء - خالية تماماً من الـ ID والتواريخ منعا لـ ILLEGAL_ARGUMENT
export interface ICreateCollegeInput {
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// واجهة التعديل - خالية أيضاً لمنع تضارب الـ IDs (Altered identifier)
export interface IUpdateCollegeInput {
  name: string;
  description: string;
}

// واجهة الـ Query Params للإرسال بالـ Request
export interface IPageableParams {
  page: number;
  size: number;
  sort?: string; // يفضل إرسالها كـ string نظيف مثل "name,asc"
}

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
export interface ICreateCollegeInput {
  name: string;
  description: string;
  createdAt: string; // أضفناهم هون لأن الباك-إيند عم يطلبهم إجباري
  updatedAt: string;
}

export interface IUpdateCollegeInput {
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
