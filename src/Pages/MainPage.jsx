import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiPaperclip, FiMic, FiWifi, FiWifiOff, FiSettings, FiSmile } from "react-icons/fi";
import Sidebar from "../Components/SideBar";
import Header from "../Components/Header";
import ChatBubble from "../Components/ChatBubble";
import useTheme from "../hooks/theme";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  // dark bg : #282828, dark text : #ECECF1
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-400">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm">{this.state.error?.message || "Unknown error"}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-4 py-2 bg-[#7B54D3] text-white rounded-md hover:bg-[#6B46C1]"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainPage = () => {
  const isLoggedIn = !!localStorage.getItem("token");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [msg, setMsg] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [activeChat, setActiveChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [chatTitle, setChatTitle] = useState("New Chat");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const { theme, setTheme, toggleTheme } = useTheme();

  const connectWebSocket = useCallback(() => {
    setIsLoading(true);
    const socket = new WebSocket("ws://localhost:3001");
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus("connected");
      setHasConnected(true);
      setConnectionError(null);
      setIsLoading(false);
      reconnectAttempts.current = 0;
      addBotMessage("Hello! I'm your Alice AI assistant. How can I help you today?");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addMessage(data.type === "user" ? "user" : "bot", data.message);
        setIsTyping(false);
        updateChatHistory(data.message);
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    socket.onclose = () => {
      setConnectionStatus("disconnected");
      setIsLoading(false);
      if (hasConnected && reconnectAttempts.current < maxReconnectAttempts) {
        addBotMessage(`Connection lost. Reconnecting (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, 3000);
      } else if (hasConnected) {
        setConnectionError("Failed to reconnect to server. Please check your connection.");
      }
    };

    socket.onerror = (error) => {
      setConnectionStatus("disconnected");
      setIsLoading(false);
      setConnectionError("WebSocket error. Please ensure the server is running.");
      console.error("WebSocket error:", error);
    };
  }, [hasConnected]);

  useEffect(() => {
    if (!isLoggedIn && msg.trim() !== "") {
      navigate("/signin");
    }
  }, [msg, isLoggedIn, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/signin");

    setChatHistory([
      {
        id: 1,
        title: "Marketing Strategy",
        lastMessage: "Let's discuss Q3 plans",
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: 2,
        title: "Product Feedback",
        lastMessage: "Users love the new UI",
        timestamp: new Date(Date.now() - 172800000),
      },
      {
        id: 3,
        title: "Technical Support",
        lastMessage: "The API is working now",
        timestamp: new Date(Date.now() - 259200000),
      },
    ]);
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      socketRef.current?.close();
    };
  }, [connectWebSocket]);

  const addMessage = (from, text, id = Date.now(), reactions = []) => {
    setChat((prev) => [...prev, { id, from, text, timestamp: new Date(), reactions }]);
  };

  const addBotMessage = (text) => addMessage("bot", text);

  const updateChatHistory = (message) => {
    if (activeChat) {
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === activeChat ? { ...chat, lastMessage: message, timestamp: new Date() } : chat
        )
      );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setIsTyping(false);
    }
  };

  const sendMessage = (messageToSend = null) => {
    stopListening();
    const text = messageToSend !== null ? messageToSend : msg;
    if (!text.trim() || connectionStatus !== "connected" || !socketRef.current) return;

    socketRef.current.send(JSON.stringify({ user_id: 2090364640, message: text }));
    addMessage("user", text);
    setMsg("");
    setShowEmojiPicker(false);
    setIsTyping(true);
    inputRef.current?.focus();

    if (!activeChat) {
      const newChatId = Date.now();
      setChatHistory((prev) => [
        {
          id: newChatId,
          title: text.slice(0, 20) + (text.length > 20 ? "..." : ""),
          lastMessage: text,
          timestamp: new Date(),
        },
        ...prev,
      ]);
      setActiveChat(newChatId);
      setChatTitle(text.slice(0, 20) + (text.length > 20 ? "..." : ""));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoggedIn) {
        navigate("/signin");
        return;
      }
      if (editingMessageId) {
        handleEditSubmit();
      } else {
        sendMessage();
      }
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      addMessage("user", `[File: ${file.name}]`);
      console.log("Uploading file:", file.name);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    if (recognitionRef.current) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.start();
    setIsListening(true);
    setIsTyping(true);

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setMsg(speechToText);
      sendMessage(speechToText);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      stopListening();
    };

    recognition.onend = () => stopListening();
  };

  const startNewChat = () => {
    setChat([]);
    setActiveChat(null);
    setChatTitle("New Chat");
    addBotMessage("Hello! I'm your Alice AI assistant. What would you like to discuss?");
  };

  const loadChat = (chatId) => {
    setActiveChat(chatId);
    const selectedChat = chatHistory.find((c) => c.id === chatId);
    setChatTitle(selectedChat?.title || "Chat");
    setChat([
      { id: Date.now(), from: "bot", text: `Loading chat ${chatId}...`, timestamp: new Date() },
      {
        id: Date.now() + 1,
        from: "user",
        text: "Sample message from this conversation",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: Date.now() + 2,
        from: "bot",
        text: "Sample response from the assistant",
        timestamp: new Date(Date.now() - 3500000),
      },
    ]);
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditText(message.text);
    setMsg(message.text);
    inputRef.current?.focus();
  };

  const handleEditSubmit = () => {
    if (!editText.trim()) return;
    setChat((prev) =>
      prev.map((msg) =>
        msg.id === editingMessageId ? { ...msg, text: editText, timestamp: new Date() } : msg
      )
    );
    setEditingMessageId(null);
    setEditText("");
    setMsg("");
    inputRef.current?.focus();
  };

  const handleDeleteMessage = (messageId) => {
    setChat((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const handleAddReaction = (messageId, emoji) => {
    setChat((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), emoji] }
          : msg
      )
    );
  };

  const toggleSettingsModal = () => {
    setShowSettings((prev) => !prev);
  };

  useEffect(() => {
    const focusInput = () => {
      if (!showSettings && !showEmojiPicker) inputRef.current?.focus();
    };

    focusInput();
    const inputElement = inputRef.current;
    inputElement.addEventListener("blur", focusInput);

    return () => {
      inputElement.removeEventListener("blur", focusInput);
    };
  }, [showSettings, showEmojiPicker]);

  const SettingsModal = ({ onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="rounded-xl p-6 w-full max-w-md shadow-2xl backdrop-blur-md bg-opacity-80
                   bg-white text-black dark:bg-gradient-to-br dark:from-[#4C3B8B] dark:to-[#6B46C1] dark:text-white"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-[#5a47a5] rounded-full">
            <FiX size={24} />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Chat Title</label>
            <input
              type="text"
              value={chatTitle}
              onChange={(e) => {
                setChatTitle(e.target.value);
                if (activeChat) {
                  setChatHistory((prev) =>
                    prev.map((chat) =>
                      chat.id === activeChat ? { ...chat, title: e.target.value } : chat
                    )
                  );
                }
              }}
              className="w-full p-3 rounded-md border focus:outline-none transition-colors
                         bg-gray-100 text-black border-gray-300 focus:ring-2 focus:ring-indigo-400
                         dark:bg-[#5a47a5] dark:text-white dark:border-gray-600 dark:focus:ring-[#7B54D3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Theme</label>
            <select
              className="w-full p-3 rounded-md border focus:outline-none transition-colors
                         bg-gray-100 text-black border-gray-300 focus:ring-2 focus:ring-indigo-400
                         dark:bg-[#5a47a5] dark:text-white dark:border-gray-600 dark:focus:ring-[#7B54D3]"
              onChange={(e) => document.documentElement.classList.toggle('dark', e.target.value === 'dark')}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Message Font Size</label>
            <select
              className="w-full p-3 rounded-md border focus:outline-none transition-colors
                         bg-gray-100 text-black border-gray-300 focus:ring-2 focus:ring-indigo-400
                         dark:bg-[#5a47a5] dark:text-white dark:border-gray-600 dark:focus:ring-[#7B54D3]"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <button
            onClick={onClose}
            className="w-full p-3 font-semibold rounded-md transition-colors
                       bg-indigo-600 text-white hover:bg-indigo-700
                       dark:bg-[#7B54D3] dark:hover:bg-[#6B46C1]"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="h-screen w-screen flex flex-row dark:bg-[#282828]">
      {/* Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-20 lg:hidden dark:bg-opacity-80 dark:bg-[#000000]"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - desktop */}
      <motion.div
        className={`hidden lg:flex h-full ${
          isCollapsed ? "w-20" : "w-72"
        } flex-shrink-0 transition-all duration-300`}
        animate={{ x: 0 }}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          recentChats={chatHistory}
          activeChat={activeChat}
          onNewChat={startNewChat}
          onSelectChat={loadChat}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          isMobile={false}
        />
      </motion.div>

      {/* Sidebar - mobile */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-30 lg:hidden"
          >
            <Sidebar
              isCollapsed={false}
              toggleSidebar={toggleSidebar}
              recentChats={chatHistory}
              activeChat={activeChat}
              onNewChat={startNewChat}
              onSelectChat={loadChat}
              closeMobileSidebar={toggleMobileSidebar}
              isMobile={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          onMenuClick={toggleMobileSidebar}
          onSidebarToggle={toggleSidebar}
          title={chatTitle}
          isSidebarCollapsed={isCollapsed}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {connectionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-0 left-0 right-0 bg-red-500/80 text-white text-center p-2 z-10 backdrop-blur-sm dark:bg-red-700/90 dark:text-gray-100"
            >
              {connectionError}
              <button
                onClick={connectWebSocket}
                className="ml-2 underline"
                aria-label="Retry WebSocket connection"
              >
                Retry
              </button>
            </motion.div>
          )}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white text-black dark:bg-[#282828] dark:text-white">
            <ErrorBoundary>
              <div className="max-w-4xl mx-auto w-full space-y-4">
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <div className="flex justify-center space-x-2">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-[#7B54D3]"
                          animate={{ y: [-4, 4, -4] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                        />
                        <motion.div
                          className="w-3 h-3 rounded-full bg-[#7B54D3]"
                          animate={{ y: [-4, 4, -4] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="w-3 h-3 rounded-full bg-[#7B54D3]"
                          animate={{ y: [-4, 4, -4] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.4,
                          }}
                        />
                      </div>
                      <div className="text-gray-400 mt-4">Connecting...</div>
                    </motion.div>
                  )}
                  {!isLoading && chat.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="text-center py-16 bg-[#2a2a2a]/50 backdrop-blur-md rounded-xl shadow-lg"
                    >
                      <img
                        src="https://img.freepik.com/free-vector/hand-drawn-flat-design-anarchy-symbol_23-2149244363.jpg?semt=ais_hybrid&w=740"
                        alt="Alice AI Logo"
                        className="w-16 h-16 mx-auto mb-4 rounded-full shadow-md"
                      />
                      <div className="text-4xl font-bold text-[#7B54D3] mb-4">
                        Alice AI Assistant
                      </div>
                      <div className="text-gray-400 max-w-md mx-auto text-lg">
                        Start a new conversation or select one from the sidebar.
                      </div>
                    </motion.div>
                  )}
                  {!isLoading &&
                    chat.map((msg, i) => (
                      <ChatBubble
                        key={msg.id}
                        message={msg}
                        isConsecutive={i > 0 && chat[i - 1].from === msg.from}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                        onAddReaction={handleAddReaction}
                      />
                    ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-start items-center space-x-3 p-4 bg-[#2a2a2a]/50 rounded-lg backdrop-blur-sm"
                    >
                      <img
                        src="https://img.freepik.com/free-vector/hand-drawn-flat-design-anarchy-symbol_23-2149244363.jpg?semt=ais_hybrid&w=740"
                        alt="Alice AI"
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="flex space-x-2">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[#7B54D3]"
                          animate={{ y: [-4, 4, -4] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[#7B54D3]"
                          animate={{ y: [-4, 4, -4] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[#7B54D3]"
                          animate={{ y: [-4, 4, -4] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.4,
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-400 italic">
                        Alice is typing...
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ErrorBoundary>
          </div>

          {/* Input area */}
          <div className="p-2 sm:p-3 md:p-4 flex flex-col max-w-4xl mx-auto w-full 
  backdrop-blur-md
  text-black dark:text-white 
  sticky bottom-0 z-10 rounded-3xl">

            <div className="flex items-center space-x-1 sm:space-x-2">

              <div className="relative flex-grow">
                <textarea
                  ref={inputRef}
                  className="w-full resize-none rounded-xl
        bg-white/90 dark:bg-[#434343]/90 
        text-black dark:text-white 
        p-2 sm:p-3 text-sm sm:text-base 
        focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500
        transition-colors shadow-md backdrop-blur-sm"
                  rows={editingMessageId ? 2 : 1}
                  style={{
                    minHeight: "40px",
                    maxHeight: "100px",
                    fontSize: "inherit",
                  }}
                  placeholder={
                    editingMessageId
                      ? "Edit your message..."
                      : "Type your message..."
                  }
                  value={msg}
                  onChange={(e) => {
                    setMsg(e.target.value);
                    if (editingMessageId) setEditText(e.target.value);
                    stopListening();
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(
                      e.target.scrollHeight,
                      100
                    )}px`;
                  }}
                  onKeyDown={handleKeyPress}
                  aria-label={
                    editingMessageId ? "Edit message input" : "Message input"
                  }
                />
              </div>

              <button
                onClick={handleVoiceInput}
                className={`
    p-2 sm:p-2 rounded-full transition-colors 
    min-w-[32px] sm:min-w-[40px] 
    text-black dark:text-white
    focus:outline-none focus:ring-2 
    focus:ring-gray-400 dark:focus:ring-gray-500
  `}
                aria-label={isListening ? "Listening..." : "Start voice input"}
                disabled={isTyping}
              >
                <FiMic size={18} className="sm:w-6 sm:h-6" />
              </button>


              <button
                onClick={editingMessageId ? handleEditSubmit : () => sendMessage()}
                className={`
    p-2 sm:p-2 rounded-full transition-colors 
    min-w-[32px] sm:min-w-[40px] 
    ${isTyping || !msg.trim()
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black dark:text-white hover:opacity-80"
                  } 
    focus:outline-none focus:ring-2 
    focus:ring-gray-400 dark:focus:ring-gray-500
  `}
                aria-label={editingMessageId ? "Submit edited message" : "Send message"}
                disabled={isTyping || !msg.trim()}
              >
                <FiSend size={18} className="sm:w-6 sm:h-6" />
              </button>


            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showSettings && <SettingsModal onClose={toggleSettingsModal} />}
      </AnimatePresence>
    </div>
  );
};

export default MainPage;