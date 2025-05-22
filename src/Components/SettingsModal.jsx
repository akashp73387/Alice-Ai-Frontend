import React, { useState } from "react";
import {
  FiX,
  FiMoon,
  FiSun,
  FiTrash2,
  FiLogOut,
  FiShield,
  FiChevronRight,
} from "react-icons/fi";
import useTheme from "../hooks/theme";

const SettingsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [enableMFA, setEnableMFA] = useState(false);
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-[#282828]/90 text-black dark:text-[#ECECF1] transition-colors duration-300 p-4">
      <div className="bg-white dark:bg-[#282828] border border-gray-300 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[95vh] h-auto flex flex-col md:flex-row relative overflow-hidden">
        {/* Close Button */}
        <button
          className="absolute top-4 right-5 p-1.5 rounded-full bg-gray-200 dark:bg-[#454545] hover:bg-gray-300 transition-all text-black dark:text-white z-10"
          onClick={onClose}
          aria-label="Close settings"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Sidebar Navigation */}
        <nav
          className="w-full md:w-56 bg-white dark:bg-[#282828] border-b md:border-b-0 md:border-r border-gray-300 flex flex-row md:flex-col py-4 md:py-8 px-4 md:px-4"
          aria-label="Settings tabs"
        >
          <h3 className="hidden md:block text-xs font-medium text-gray-500 dark:text-[#ECECF1] uppercase tracking-wider px-3 mb-5">
            Settings
          </h3>
          {["general", "security"].map((tab) => (
            <button
              key={tab}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm mb-1 transition-all w-full ${
                activeTab === tab
                  ? "bg-gray-200 dark:bg-[#3a3a3a] text-black-600"
                  : "text-black-600 hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
              }`}
              onClick={() => setActiveTab(tab)}
              aria-selected={activeTab === tab}
              role="tab"
            >
              <span className="capitalize">{tab}</span>
              <FiChevronRight
                className={`w-4 h-4 transition-transform ${
                  activeTab === tab ? "rotate-90" : ""
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <section
          className="flex-1 p-4 md:p-6 overflow-y-auto"
          role="tabpanel"
        >
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-black dark:text-[#ECECF1] mb-6 flex items-center">
                <span className="w-1 h-6 bg-gray-400 dark:bg-[#ECECF1] rounded-full mr-3"></span>
                General Settings
              </h2>

              {/* Appearance Section */}
              <div className="bg-gray-100 dark:bg-[#313131] border border-gray-300 dark:border-[#626262] rounded-xl p-5 hover:border-gray-400 dark:hover:border-[#888888]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center">
                    <div className="p-2 rounded-lg bg-blue-100 mr-3">
                      {theme === "dark" ? (
                        <FiMoon className="w-5 h-5 text-purple-500" />
                      ) : (
                        <FiSun className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-black dark:text-[#ECECF1]">Appearance</h3>
                      <p className="text-xs text-gray-600 dark:text-[#bcbcbc]">Customize your theme</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={`p-1.5 rounded-lg ${
                        theme === "light" ? "bg-gray-300" : "hover:bg-gray-200"
                      }`}
                      aria-label="Set light theme"
                    >
                      <FiSun
                        className={`w-5 h-5 ${
                          theme === "light"
                            ? "text-yellow-500"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`p-1.5 rounded-lg ${
                        theme === "dark" ? "bg-gray-300" : "hover:bg-gray-200"
                      }`}
                      aria-label="Set dark theme"
                    >
                      <FiMoon
                        className={`w-5 h-5 ${
                          theme === "dark"
                            ? "text-purple-500"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete + Logout Section */}
              <div className="rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-black dark:text-[#ECECF1]">Delete All Chats</h4>
                    <p className="text-xs text-gray-600 dark:text-[#bcbcbc]">Permanently remove all your conversation history</p>
                  </div>
                  <button className="px-4 py-2 bg-red-100 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-all">
                    Delete All
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-300 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-black dark:text-[#ECECF1]">Log Out</h4>
                    <p className="text-xs text-gray-600 dark:text-[#bcbcbc]">Sign out of your account on this device</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-[#464646] border border-gray-300 dark:border-[#838383] text-black dark:text-[#ECECF1] text-sm rounded-lg hover:bg-gray-300 transition-all flex items-center">
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-black dark:text-[#ECECF1] mb-6 flex items-center">
                <span className="w-1 h-6 bg-gray-400 dark:bg-[#ECECF1] rounded-full mr-3"></span>
                Security Settings
              </h2>

              {/* MFA Section */}
              <div className="bg-gray-100 dark:bg-[#313131] border border-gray-300 dark:border-[#626262] rounded-xl p-5 hover:border-gray-400 dark:hover:border-[#888888] transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-blue-100 mr-3">
                      <FiShield className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black dark:text-[#ECECF1]">
                        Multi-Factor Authentication
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-[#bcbcbc] mt-1 max-w-md">
                        Add an extra layer of security to your account. When
                        enabled, you'll be required to enter both your password
                        and an authentication code from your mobile device.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={enableMFA}
                      onChange={() => setEnableMFA(!enableMFA)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SettingsModal;
