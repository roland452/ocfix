import { create } from "zustand";

const useToast = create((set) => ({
    toast: { message:'', success: null},
    setToast: (message, success) => set({ toast: { message, success } })
}))

export default useToast;