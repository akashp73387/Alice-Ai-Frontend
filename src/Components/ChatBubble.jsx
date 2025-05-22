import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiTrash } from "react-icons/fi";
import useTheme from "../hooks/theme";
import alicedark from "../../assets/Alice-logo.png";
// import alicelight from '../../assets/Alice-light.png';

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChatBubble = ({ message, isConsecutive, onEdit, onDelete }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const bubbleClasses = {
  user: {
    container: "justify-end",
    bubble: "bg-[#e5e5ea] dark:bg-[#3a3a38] text-black dark:text-[#f0f0ea]",
    time: "text-[#666] dark:text-[#a0a098]",
  },
  bot: {
    container: "justify-start",
    bubble: "", // No bubble styling
    time: "text-[#666] dark:text-[#a0a098]",
    line: "border-l-4 border-gray-400 dark:border-gray-600 pl-4 text-black dark:text-[#f0f0ea]",
  },
};


  const currentStyle = bubbleClasses[message.from];

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (message.from === "user") {
      setShowContextMenu(true);
    }
  };

  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`flex ${currentStyle.container} ${isConsecutive ? "mt-1" : "mt-4"} px-4 relative`}
      onContextMenu={handleContextMenu}
    >
      <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
        {!isConsecutive && (
          <div className="flex items-center gap-2 mb-2">
            <img
              src={
                message.from === "bot"
                  ? alicedark
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={message.from === "bot" ? "Bot Logo" : "User Avatar"}
              className="w-8 h-8 rounded-full object-cover shadow-md"
            />
            <span className="text-sm font-medium text-black dark:text-white">
              {message.from === "bot" ? "Alice AI" : "You"}
            </span>
          </div>
        )}

        <div className="flex items-end relative">
          <motion.div
            className={`relative px-4 py-3 rounded-xl ${currentStyle.bubble} shadow-lg group backdrop-blur-sm bg-opacity-80`}
            whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="whitespace-pre-wrap break-words text-sm md:text-base">
              {message.text}
            </div>
            <div className={`text-xs mt-1 text-right ${currentStyle.time}`}>
              {formatTime(message.timestamp)}
            </div>

          </motion.div>
        </div>

        {/* Removed reactions display and emoji reaction buttons */}
      </div>

      <AnimatePresence>
        {showContextMenu && message.from === "user" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-4 top-0 bg-white dark:bg-[#5a47a5]/80 rounded-lg shadow-lg p-2 z-10 backdrop-blur-md"
            onClick={() => setShowContextMenu(false)}
          >
            <button
              onClick={() => onEdit(message)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#6B46C1] transition-colors"
            >
              <FiEdit className="mr-2" size={16} /> Edit
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#6B46C1] transition-colors"
            >
              <FiTrash className="mr-2" size={16} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatBubble;
