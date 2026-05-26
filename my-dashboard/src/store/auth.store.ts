import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IUser } from "../API/Authorization/authorization.interface";

export const $AuthStoreKey = "volunteer_auth_state";

interface AuthState {
  token: string | null;
  user: IUser | null;
  setAuth: (user: IUser, token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },
    }),
    {
      name: $AuthStoreKey,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useAuthStore;
