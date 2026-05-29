import ApiInstance from "../api.instance";

export interface ICategory {
  categoryId: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategoryPage {
  content: ICategory[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const getCategories = async (page = 0, size = 100) => {
  const res = await ApiInstance.get<ICategoryPage>("/categories", {
    params: { page, size },
  });
  return res.data;
};

export const createCategory = async (data: { name: string }) => {
  const res = await ApiInstance.post<ICategory>("/categories", data);
  return res.data;
};

export const updateCategory = async (id: number, data: { name: string }) => {
  const res = await ApiInstance.put<ICategory>(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: number) => {
  const res = await ApiInstance.delete(`/categories/${id}`);
  return res.data;
};
