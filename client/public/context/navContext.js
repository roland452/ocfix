import { create } from "zustand";

const useNavActive = create((set) => ({
    isActiveNav: false, 
    setIsActive: (setActive) => set({ isActiveNav: setActive }),
}))

export default useNavActive;