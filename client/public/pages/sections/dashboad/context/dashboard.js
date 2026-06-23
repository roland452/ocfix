import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

const useDashboard = create()(
    persist((set) => ({
        statsData: [],


        setStatsData: (value) => set({statsData: value}),
    }),
    {
        name: 'dashboard_stats',
        storage: createJSONStorage(() => sessionStorage)
    }) 
);

export default useDashboard;
