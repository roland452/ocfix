import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'

const useProfile = create()(
    persist((set) => ({
        profile: [],
        setProfile: ((profileValue) => set({ profile: profileValue }))
    }),
    {
        name: 'profile',
        storage: createJSONStorage(() => sessionStorage)
    }
    )
)

export default useProfile