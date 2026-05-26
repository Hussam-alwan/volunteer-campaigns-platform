import axiosInstance from "../api.instance";
import {
  type ICreateApplicationInput,
  type IApplication,
  type PaginatedResponse,
} from "@/API/Application/Application.interfaces";

export const getApplications = async () => {
  const response = await axiosInstance.get<PaginatedResponse<IApplication>>(
    "/applications",
    {
      params: {
        sort: "createdAt,desc",
      },
    },
  );

  return response.data;
};

export const createApplication = async (payload: ICreateApplicationInput) => {
  const response = await axiosInstance.post<IApplication>(
    "/applications",
    payload,
  );

  return response.data;
};

export const updateApplicationStatus = async (
  id: number,
  payload: Partial<IApplication>,
) => {
  const response = await axiosInstance.put<IApplication>(
    `/applications/${id}`,
    payload,
  );

  return response.data;
};
