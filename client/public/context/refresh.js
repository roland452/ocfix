import { create } from "zustand";

const useRefresh = create((set) => ({
    refresh:false,
    setRefresh: ((refreshValue) => set({ refresh: refreshValue }))
}))

export default useRefresh;