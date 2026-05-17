// src/apis/authorization/authorization.interface.ts

export interface IUserData {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  image: string | null;
}

export interface IAuth {
  token: string;
  data: IUserData;
}
