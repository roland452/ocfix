import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

const useLoginContext = create()(
    persist((set) => ({
        loginSection: 'login', 
        email: '',

        setLoginSection: (section) => set({ loginSection : section }),
        setEmail: (value) => set({ email: value }),
        
        
    }),
    {
        name: 'login-auth',
        storage: createJSONStorage(() => sessionStorage)
    })
);

export default useLoginContext;
