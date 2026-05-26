import ApiInstance from "../api.instance";
import { AuthApiRoutes } from "./authorization.api-routes";
import type {
  ILoginPayload,
  IRegisterPayload,
  IUser,
} from "./authorization.interface";

export interface ILoginResponse extends IUser {
  accessToken: string;
}

export const SESSION_TOKEN = "cookie_session_active";

const login = async (payload: ILoginPayload): Promise<ILoginResponse> => {
  const response = await ApiInstance.post<IUser>(AuthApiRoutes.login, payload);

  const tokenFromHeader =
    response.headers["authorization"] || response.headers["Authorization"];
  const accessToken = tokenFromHeader
    ? String(tokenFromHeader).replace(/^Bearer\s+/i, "")
    : SESSION_TOKEN;

  return { ...response.data, accessToken };
};

const register = async (payload: IRegisterPayload): Promise<IUser> => {
  const response = await ApiInstance.post<IUser>(
    AuthApiRoutes.register,
    payload,
  );
  return response.data;
};

const authApis = { login, register };

export default authApis;
