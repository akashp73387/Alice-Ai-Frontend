import React, { useState, useEffect } from 'react';
import {
  FiMenu,
  FiUser,
  FiMoon,
  FiSun,
  FiLogOut,
  FiSettings,
  FiBell
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';
import useTheme from '../hooks/theme';
import alicedark from '../../assets/Alice-dark.png';
import alicelight from '../../assets/Alice-light.png';

const Header = ({ onMenuClick, onSidebarToggle, title, isSidebarCollapsed }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Simulate notification updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => (prev < 5 ? prev + 1 : prev));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const handleSettings = () => {
    setIsProfileOpen(false);
    setIsSettingsModalOpen(true);
  };

  return (
    <header className="flex items-center justify-between px-4 bg-white/90 dark:bg-[#282828] text-black dark:text-[#ECECF1] shadow-lg border-b border-[#f8f1f1] dark:border-[#343434]">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label="Toggle mobile sidebar"
      >
        <FiMenu size={26} />
      </button>

      {/* Sidebar Toggle (hidden for now, use lg:block to show) */}
      <button
        onClick={onSidebarToggle}
        className="hidden lg:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <FiMenu size={26} />
      </button>

      {/* Centered Logo */}
     <div className="flex-1 flex justify-start items-center h-[74px]">
  <img
    src={theme === 'dark' ? alicedark : alicelight}
    alt="Alice Logo"
    className="h-full w-auto object-contain"
  />
</div>


      {/* Right Controls */}
      <div className="relative flex items-center space-x-3">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <FiSun size={24} /> : <FiMoon size={24} />}
        </button>

        {/* Profile Menu Button */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Toggle profile menu"
        >
          <FiUser size={24} />
        </button>

        {/* Profile Dropdown */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-14 w-56 bg-white dark:bg-[#3a3a3a] rounded-lg shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-600"
            >
              <div className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600">
                {localStorage.getItem('user') || 'User Profile'}
              </div>
              <button
                onClick={handleSettings}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#565656] transition-colors"
              >
                <FiSettings className="mr-2" size={18} /> Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#565656] transition-colors"
              >
                <FiLogOut className="mr-2" size={18} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        {isSettingsModalOpen && (
          <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />
        )}
      </div>
    </header>
  );
};

export default Header;
