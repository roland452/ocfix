import { create } from "zustand";
import { persist } from 'zustand/middleware'

const useFontIndex = create()(
    persist((set) => ({
        index: 0,
        setIndex: ((indexValue) => set({ index: indexValue}))
    }),
    {
        name: 'font',
    }
    )
)

export default useFontIndex