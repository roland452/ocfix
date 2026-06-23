import { create }  from 'zustand'
import { persist } from 'zustand/middleware'

const useMode = create()(
    persist((set) => ({
        mode: '', 
        setMode: ((modeValue) => set({ mode: modeValue })),
    }),
    {
        name:'mode',
    }
    )
)

export default useMode;

