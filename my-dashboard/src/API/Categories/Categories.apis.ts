import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApiInstance from "../api.instance";

export interface ICategory {
  categoryId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryInput {
  name: string;
}

export interface ICategoriesPage {
  content: ICategory[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const ROUTE = "/categories";

const getAll = async (page = 0, size = 100): Promise<ICategoriesPage> => {
  const { data } = await ApiInstance.get<ICategoriesPage>(ROUTE, {
    params: { page, size },
  });
  return data;
};

const create = async (payload: ICategoryInput): Promise<ICategory> => {
  const { data } = await ApiInstance.post<ICategory>(ROUTE, payload);
  return data;
};

const update = async (
  id: number,
  payload: ICategoryInput,
): Promise<ICategory> => {
  const { data } = await ApiInstance.put<ICategory>(`${ROUTE}/${id}`, payload);
  return data;
};

const remove = async (id: number): Promise<void> => {
  await ApiInstance.delete(`${ROUTE}/${id}`);
};

const categoriesApis = { getAll, create, update, remove };
export default categoriesApis;

export const categoryQueryKey = ["categories"] as const;

export const useGetCategories = (page = 0, size = 10) =>
  useQuery({
    queryKey: [...categoryQueryKey, page, size],
    queryFn: () => getAll(page, size),
  });

export const useAddCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICategoryInput) => create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryQueryKey }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ICategoryInput }) =>
      update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryQueryKey }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryQueryKey }),
  });
};
