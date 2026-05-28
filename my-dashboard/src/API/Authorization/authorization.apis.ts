import ApiInstance from "../api.instance";
import { AuthApiRoutes } from "./authorization.api-routes";
import type {
  ILoginPayload,
  IRegisterPayload,
  IUser,
} from "./authorization.interface";

// المصادقة قائمة على الكوكيز: السيرفر يضبط كوكي HttpOnly عند الدخول،
// و ApiInstance يرسلها تلقائياً عبر withCredentials. لا حاجة لتخزين أي توكن.

const login = async (payload: ILoginPayload): Promise<IUser> => {
  const { data } = await ApiInstance.post<IUser>(AuthApiRoutes.login, payload);
  return data;
};

const register = async (payload: IRegisterPayload): Promise<IUser> => {
  const { data } = await ApiInstance.post<IUser>(
    AuthApiRoutes.register,
    payload,
  );
  return data;
};

const logout = async (): Promise<void> => {
  await ApiInstance.post(AuthApiRoutes.logout);
};

const me = async (): Promise<IUser> => {
  const { data } = await ApiInstance.get<IUser>(AuthApiRoutes.me);
  return data;
};

const authApis = { login, register, logout, me };

export default authApis;
