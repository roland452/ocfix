import { create } from "zustand";

const useAuth = create((set) => ({
    auth:false,
    setAuth: ((authValue) => set({ auth: authValue }))
}))

export default useAuth;