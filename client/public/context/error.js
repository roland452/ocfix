import { create } from "zustand";

const useError = create((set) => ({
    error:false,
    setError: ((errorValue) => set({ error: errorValue }))
}))

export default useError;