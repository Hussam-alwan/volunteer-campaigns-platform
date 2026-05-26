// src/apis/college/Collegesqueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import collegesApis from "./Colleges.apis";
import type { IPageableParams, ICollegeInput } from "./Colleges.interfaces";

export const useCollegesFields = {
  COLLEGES_LIST: "COLLEGES_LIST",
  COLLEGE_DETAILS: "COLLEGE_DETAILS",
};

// Hook لجلب الكليات
export const useGetColleges = (params: IPageableParams) => {
  return useQuery({
    queryKey: [useCollegesFields.COLLEGES_LIST, params],
    queryFn: () => collegesApis.getAllColleges(params),
  });
};

// Hook لإضافة كلية
export const useAddCollege = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICollegeInput) => collegesApis.addCollege(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [useCollegesFields.COLLEGES_LIST],
      });
    },
  });
};

// Hook لتعديل كلية
export const useUpdateCollege = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ICollegeInput }) =>
      collegesApis.updateCollege(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [useCollegesFields.COLLEGES_LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [useCollegesFields.COLLEGE_DETAILS, variables.id],
      });
    },
  });
};

// Hook لحذف كلية
export const useDeleteCollege = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => collegesApis.deleteCollege(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [useCollegesFields.COLLEGES_LIST],
      });
    },
  });
};
const collegesQueries = {
  useGetColleges,
  useAddCollege,
  useUpdateCollege,
  useDeleteCollege,
};

export default collegesQueries;
