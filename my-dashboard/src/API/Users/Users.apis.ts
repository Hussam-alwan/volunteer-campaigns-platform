import { useQuery } from "@tanstack/react-query";
import ApiInstance from "../api.instance";

export interface IUserRow {
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

interface IUsersPage {
  content: IUserRow[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const getAllUsers = async (page = 0, size = 100): Promise<IUsersPage> => {
  const { data } = await ApiInstance.get<IUsersPage>("/users", {
    params: { page, size },
  });
  return data;
};

export const useGetAllUsers = (page = 0, size = 100) =>
  useQuery({
    queryKey: ["users", "list", page, size],
    queryFn: () => getAllUsers(page, size),
  });

const usersApis = { getAllUsers };
export default usersApis;
