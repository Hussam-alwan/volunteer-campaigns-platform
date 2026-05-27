import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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

export interface IUserInput {
  studentNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  academicYear?: number;
  isBanned: boolean;
  college: number;
}

interface IUsersPage {
  content: IUserRow[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const USERS_LIST_KEY = "users-list";

const getAllUsers = async (page = 0, size = 100): Promise<IUsersPage> => {
  const { data } = await ApiInstance.get<IUsersPage>("/users", {
    params: { page, size },
  });
  return data;
};

const createUser = async (payload: IUserInput): Promise<IUserRow> => {
  const { data } = await ApiInstance.post<IUserRow>("/users", payload);
  return data;
};

const updateUser = async (
  id: number,
  payload: IUserInput,
): Promise<IUserRow> => {
  const { data } = await ApiInstance.put<IUserRow>(`/users/${id}`, payload);
  return data;
};

const deleteUser = async (id: number): Promise<void> => {
  await ApiInstance.delete(`/users/${id}`);
};

const banUser = async (id: number): Promise<IUserRow> => {
  const { data } = await ApiInstance.patch<IUserRow>(`/users/${id}/ban`);
  return data;
};

export const useGetAllUsers = (page = 0, size = 100) =>
  useQuery({
    queryKey: [USERS_LIST_KEY, page, size],
    queryFn: () => getAllUsers(page, size),
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IUserInput) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_LIST_KEY] }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: IUserInput }) =>
      updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_LIST_KEY] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_LIST_KEY] }),
  });
};

export const useBanUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => banUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_LIST_KEY] }),
  });
};

const usersApis = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  banUser,
};
export default usersApis;
