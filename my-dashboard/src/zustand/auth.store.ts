import { create } from "zustand";

interface AuthState {
  user: any | null;
  token: string | null;
  // 👈 تأكد من تعريف الـ actions هنا
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  // تنفيذ الـ Actions
  setAuth: (user, token) => {
    localStorage.setItem("token", token); // تخزين التوكن
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
