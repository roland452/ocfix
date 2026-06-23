
import { AiFillAudio } from "react-icons/ai";
import { motion } from "framer-motion";

const AudioButton = ({ startRecording }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={startRecording}
      className="bg-[var(--active-color)] text-white p-3 rounded-full transition-colors shadow-md shadow-[var(--active-color)]/20"
    >
      <AiFillAudio size={18} />
    </motion.button>
  );
};

export default AudioButton;