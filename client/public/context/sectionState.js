import { create }  from 'zustand'
import { persist } from 'zustand/middleware'

const useSection = create()(
    persist((set) => ({
        activeSection: 'dashboard', 
        setActiveSection: ((sectionName) => set({ activeSection: sectionName })),
    }),
    {
        name:'section',
    }
    )
)

export default useSection;

