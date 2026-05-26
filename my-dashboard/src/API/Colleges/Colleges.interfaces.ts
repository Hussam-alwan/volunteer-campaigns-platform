export interface ICollege {
  collegeId: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICollegeInput {
  name: string;
  description: string;
}

export interface IPageableParams {
  page: number;
  size: number;
  sort?: string;
}

export interface ICollegesPaginatedResponse {
  content: ICollege[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
