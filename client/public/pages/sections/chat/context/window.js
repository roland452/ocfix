import { create } from "zustand";

const useWindow = create((set) => ({
    window:'',
    setWindow: ((windowValue) => set({ window: windowValue }))
}))

export default useWindow;