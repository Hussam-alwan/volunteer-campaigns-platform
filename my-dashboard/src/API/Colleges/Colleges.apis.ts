import ApiInstance from "../api.instance";
import CollegesApiRoutes from "./Colleges.api-routes";
import type {
  ICollege,
  ICollegeInput,
  IPageableParams,
  ICollegesPaginatedResponse,
} from "./Colleges.interfaces";

const getAllColleges = async (
  params: IPageableParams,
): Promise<ICollegesPaginatedResponse> => {
  const { data } = await ApiInstance.get<ICollegesPaginatedResponse>(
    CollegesApiRoutes.GetAll,
    { params },
  );
  return data;
};

const addCollege = async (payload: ICollegeInput): Promise<ICollege> => {
  const { data } = await ApiInstance.post<ICollege>(
    CollegesApiRoutes.GetAll,
    payload,
  );
  return data;
};

const updateCollege = async (
  id: number,
  payload: ICollegeInput,
): Promise<ICollege> => {
  const { data } = await ApiInstance.put<ICollege>(
    CollegesApiRoutes.Update(id),
    payload,
  );
  return data;
};

const deleteCollege = async (id: number): Promise<void> => {
  await ApiInstance.delete(CollegesApiRoutes.Delete(id));
};

const collegesApis = {
  getAllColleges,
  addCollege,
  updateCollege,
  deleteCollege,
};

export default collegesApis;
