import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IUser } from "../API/Authorization/authorization.interface";

export const $AuthStoreKey = "volunteer_auth_state";

interface AuthState {
  user: IUser | null;
  // الجلسة الحقيقية محفوظة في كوكي HttpOnly على السيرفر.
  // هذا العلم يُستخدم فقط لحماية المسارات في الواجهة.
  isAuthenticated: boolean;
  login: (user: IUser) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: $AuthStoreKey,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useAuthStore;
