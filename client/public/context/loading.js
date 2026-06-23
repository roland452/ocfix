import { create } from "zustand";

const useLoading = create((set) => ({
   loading:false,
    setLoading: ((loadingValue) => set({loading:loadingValue }))
}))

export default useLoading;