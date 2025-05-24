import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiPaperclip, FiMic } from "react-icons/fi";
import Sidebar from "../Components/SideBar";
import Header from "../Components/Header";
import ChatBubble from "../Components/ChatBubble";
import useTheme from "../hooks/theme";
import alicelogo from "../../assets/Alice-logo.png";

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
  const [hasConnected, setHasConnected] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [chatTitle, setChatTitle] = useState("New Chat");
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
      // Remove addBotMessage here to avoid duplicate welcome message
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

    socket.onclose = (event) => {
      setConnectionStatus("disconnected");
      setIsLoading(false);
      // WebSocket close codes 1006 and 1005 often mean network failure or server unreachable
      if (hasConnected && reconnectAttempts.current < maxReconnectAttempts) {
        addBotMessage(
          `Connection lost. Reconnecting (${
            reconnectAttempts.current + 1
          }/${maxReconnectAttempts})...`
        );
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, 3000);
      } else if (hasConnected) {
        setConnectionError(
          "Failed to reconnect to server. Please check your connection."
        );
      } else {
        // Initial connection failed (probably server down)
        setConnectionError("Network error, please try again.");
      }
    };

    socket.onerror = (error) => {
      setConnectionStatus("disconnected");
      setIsLoading(false);
      if (!hasConnected) {
        // Connection attempt failed — network/server probably down
        setConnectionError("Network error, please try again.");
      } else {
        // Some other error after connection established
        setConnectionError(
          "WebSocket error occurred. Please check your connection."
        );
      }
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
    setChat((prev) => [
      ...prev,
      { id, from, text, timestamp: new Date(), reactions },
    ]);
  };

  const addBotMessage = (text) => addMessage("bot", text);

  const updateChatHistory = (message) => {
    if (activeChat) {
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? { ...chat, lastMessage: message, timestamp: new Date() }
            : chat
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
    if (!text.trim() || connectionStatus !== "connected" || !socketRef.current)
      return;

    socketRef.current.send(
      JSON.stringify({ user_id: 2090364640, message: text })
    );
    addMessage("user", text);
    setMsg("");
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
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
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
    addBotMessage(
      "Hello! I'm your Alice AI assistant. What would you like to discuss?"
    );
  };

  const loadChat = (chatId) => {
    setActiveChat(chatId);
    const selectedChat = chatHistory.find((c) => c.id === chatId);
    setChatTitle(selectedChat?.title || "Chat");
    setChat([
      {
        id: Date.now(),
        from: "bot",
        text: `Loading chat ${chatId}...`,
        timestamp: new Date(),
      },
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
        msg.id === editingMessageId
          ? { ...msg, text: editText, timestamp: new Date() }
          : msg
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

  useEffect(() => {
    const focusInput = () => {
      inputRef.current?.focus();
    };

    focusInput();
    const inputElement = inputRef.current;
    inputElement.addEventListener("blur", focusInput);

    return () => {
      inputElement.removeEventListener("blur", focusInput);
    };
  }, []);

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
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-center p-3 z-10 shadow-lg dark:from-red-600 dark:to-red-700"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Network error please try again</span>
              </div>
              <button
                onClick={connectWebSocket}
                className="ml-3 px-2 py-1 bg-white text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                aria-label="Retry WebSocket connection"
              >
                Retry
              </button>
            </motion.div>
          )}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white text-black dark:bg-[#282828] dark:text-white">
            <div className="max-w-4xl mx-auto w-full space-y-4">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-16"
                  >
                    <div className="flex justify-center items-center space-x-3">
                      <motion.div
                        className="w-4 h-4 rounded-full bg-gradient-to-br from-[#7B54D3] to-[#A78BFA]"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.div
                        className="w-4 h-4 rounded-full bg-gradient-to-br from-[#7B54D3] to-[#A78BFA]"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.2,
                        }}
                      />
                      <motion.div
                        className="w-4 h-4 rounded-full bg-gradient-to-br from-[#7B54D3] to-[#A78BFA]"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.4,
                        }}
                      />
                    </div>
                    <motion.div
                      className="text-gray-400 mt-4 text-sm font-medium"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Establishing connection...
                    </motion.div>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex justify-start items-center space-x-3 p-4"
                  >
                    <motion.img
                      src={alicelogo}
                      alt="Alice AI"
                      className="w-6 h-6 rounded-full"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="flex space-x-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7B54D3] to-[#A78BFA]"
                        animate={{
                          y: [-4, 4, -4],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7B54D3] to-[#A78BFA]"
                        animate={{
                          y: [-4, 4, -4],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.2,
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7B54D3] to-[#A78BFA]"
                        animate={{
                          y: [-4, 4, -4],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.4,
                        }}
                      />
                    </div>
                    <motion.div
                      className="text-sm text-gray-400 italic"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Alice is typing...
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="p-2 sm:p-3 md:p-4 flex flex-col max-w-4xl mx-auto w-full backdrop-blur-md text-black dark:text-white sticky bottom-0 z-10 rounded-3xl">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="relative flex-grow">
                <textarea
                  ref={inputRef}
                  className="w-full resize-none rounded-xl bg-white/90 dark:bg-[#434343]/90 text-black dark:text-white p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors shadow-md backdrop-blur-sm"
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
                className="p-2 sm:p-2 rounded-full transition-colors min-w-[32px] sm:min-w-[40px] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                aria-label={isListening ? "Listening..." : "Start voice input"}
                disabled={isTyping}
              >
                <FiMic size={18} className="sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={
                  editingMessageId ? handleEditSubmit : () => sendMessage()
                }
                className={`p-2 sm:p-2 rounded-full transition-colors min-w-[32px] sm:min-w-[40px] ${
                  isTyping || !msg.trim()
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black dark:text-white hover:opacity-80"
                } focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500`}
                aria-label={
                  editingMessageId ? "Submit edited message" : "Send message"
                }
                disabled={isTyping || !msg.trim()}
              >
                <FiSend size={18} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
