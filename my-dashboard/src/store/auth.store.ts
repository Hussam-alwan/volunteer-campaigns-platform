import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type IAuth } from "../API/auth.interface";

export const $AuthStoreKey = "volunteer_auth_state";

const initialState: IAuth = {
  token: "",
  data: {
    id: 0,
    name: "",
    email: "",
    phoneNumber: "",
    image: null,
  },
};

type AuthActions = {
  login: (data: IAuth) => void;
  logout: () => void;
};

const stateCreator: StateCreator<IAuth & AuthActions> = (set) => ({
  ...initialState,
  login: (authData) => {
    set(authData);
  },
  logout: () => {
    set({ ...initialState });
  },
});

const useAuthStore = create<IAuth & AuthActions>()(
  persist(stateCreator, {
    name: $AuthStoreKey,
    storage: createJSONStorage(() => localStorage),
  }),
);

export default useAuthStore;
