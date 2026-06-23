import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

const useFeedback = create()(
    persist((set) => ({
        feedback: [],
        // Support both direct values and functional updates
        setFeedback: (update) => set((state) => ({
            feedback: typeof update === 'function' ? update(state.feedback) : update
        })),
    }),
    {
        name: 'feedback',
        storage: createJSONStorage(() => sessionStorage)
    })
);

export default useFeedback;
