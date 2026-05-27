export interface IUser {
  userId: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  academicYear: number;
  college: number;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IAuth = IUser;

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  academicYear: number;
  college: number;
  isBanned: boolean;
}
