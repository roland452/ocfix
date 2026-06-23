import { create } from "zustand";

const useSignupContext = create((set) => ({
    signupSection: 'email_password', 
    password: '',

    setSignupSection: (section) => set({ signupSection : section }),
    setPassword: (value) => set({ password: value }),
}));

export default useSignupContext;
