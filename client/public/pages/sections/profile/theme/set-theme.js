import { create } from "zustand";
import { persist } from 'zustand/middleware'

const useThemeIndex = create()(
    persist((set) => ({
        index: 0,
        setIndex: ((indexValue) => set({ index: indexValue}))
    }),
    {
        name: 'theme',
    }
    )
)

export default useThemeIndex