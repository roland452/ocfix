import { create } from "zustand";

const useSettingPopup = create((set) => ({
    section: '',
    setSection: ((sectionName) => set({ section: sectionName}))
}))

export default useSettingPopup