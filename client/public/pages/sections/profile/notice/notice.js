import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

const useNotices = create()(
    persist((set) => ({

        notices: [], 

        
        setNotices: (value) => set({notices: value}),
    }),
    {
        name: 'notices',
        storage: createJSONStorage(() => sessionStorage)
    }) 
);

export default useNotices;
