import React, { useState } from 'react';
import { FiPlus, FiChevronLeft, FiChevronRight, FiX, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useTheme from "../hooks/theme";

const Sidebar = ({
  isCollapsed,
  toggleSidebar,
  recentChats,
  activeChat,
  onNewChat,
  onSelectChat,
  closeMobileSidebar,
  isMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredChats = recentChats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div
      className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-72'} 
  bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white transition-all duration-300 
  ${isMobile ? 'fixed inset-y-0 left-0 z-30 shadow-2xl' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
        {!isCollapsed && (
          <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">
            <span className='font-bold text-2xl tracking-wide'>Auto</span>
            <span className='text-purple-600 '>intelli</span>
            {/* <span className='text-purple-500 ps-0.5'>n</span>
            <span className='text-blue-500 ps-0.5'>t</span>
            <span className='text-blue-400 ps-0.5'>e</span>
            <span className='text-green-500 ps-0.5'>l</span>
            <span className='text-orange-500 ps-0.5'>l</span>
            <span className='text-indigo-500 ps-0.5'>i</span> */}
          </h2>
        )}
        {isMobile ? (
          <button
            onClick={closeMobileSidebar}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
            aria-label="Close sidebar"
          >
            <FiX size={26} className="text-neutral-800 dark:text-white" />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <FiChevronRight size={26} className="text-neutral-800 dark:text-white" />
            ) : (
              <FiChevronLeft size={26} className="text-neutral-800 dark:text-white" />
            )}
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} 
    p-4 hover:bg-neutral-200 dark:hover:bg-neutral-800 
    text-neutral-800 dark:text-white transition-colors 
    focus:outline-none focus:ring-2 focus:ring-neutral-400`}
        aria-label="Start new chat"
      >
        <FiPlus size={22} className={isCollapsed ? '' : 'mr-3'} />
        {!isCollapsed && <span className="font-semibold">New Conversation</span>}
      </button>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-2 bg-neutral-50 dark:bg-neutral-900">
        <AnimatePresence>
          {filteredChats.length === 0 && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 text-neutral-500 dark:text-neutral-400 text-center"
            >
              No chats found
            </motion.div>
          )}
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onClick={() => onSelectChat(chat.id)}
              className={`p-4 mx-2 cursor-pointer 
          hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors 
          focus:outline-none focus:ring-2 focus:ring-neutral-400 
          ${activeChat === chat.id ? 'bg-neutral-200 dark:bg-neutral-800' : ''}`}
              role="button"
              aria-label={`Select chat: ${chat.title}`}
            >
              {isCollapsed ? (
                <div className="text-center text-lg font-bold text-neutral-800 dark:text-white" title={chat.title}>
                  {chat.title.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-semibold truncate text-lg text-neutral-800 dark:text-white">{chat.title}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300 truncate">{chat.lastMessage}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(chat.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Sidebar;