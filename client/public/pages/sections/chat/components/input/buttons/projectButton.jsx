import React from 'react';
import { FiBriefcase } from "react-icons/fi";
import useChat from '../../../context/chat';

const ProjectButton = () => {
  const setReviewModal = useChat((state) => state.setReviewModal)
  return (
    <button 
      onClick={() => setReviewModal(true)}
      type="button"
      className="p-3 bg-[var(--active-color)]/10 text-[var(--active-color)] rounded-2xl hover:bg-[var(--active-color)] hover:text-white transition-all flex items-center justify-center"
      title="Submit Work / Project Review"
    >
        <FiBriefcase size={22} />
    </button>
  );
};

export default ProjectButton;
