export type TApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN"
  | string;

export interface IApplication {
  id: number;

  motivationLetter: string;
  status: TApplicationStatus;

  rejectionReason: string | null;
  adminNotes: string | null;

  appliedAt: string;
  reviewedAt: string | null;
  withdrawnAt: string | null;

  createdAt: string;
  updatedAt: string;

  removalReason: string | null;
  removedAt: string | null;

  student: number;
  campaign: number;
  reviewedBy: number | null;
  removedBy: number | null;
}
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;

  first: boolean;
  last: boolean;

  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
export interface ICreateApplicationInput {
  motivationLetter: string;
  student: number;
  campaign: number;
  status: TApplicationStatus;
  appliedAt: string;
}
