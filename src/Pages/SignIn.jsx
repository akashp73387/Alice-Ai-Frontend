import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiArrowRight } from "react-icons/fi";
import alicedark from "../../assets/Alice-dark.png";
import backgroundImage from "../../assets/back-img.jpg";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://195.201.164.158:8002/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        if (rememberMe) localStorage.setItem("rememberMe", "true");
        navigate("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative p-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-opacity-80 z-0"></div>

      <div className="relative z-10 flex max-w-5xl w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {!isMobile && (
          <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-10 text-white">
            <div className="text-center mb-8">
              <img
                src={alicedark}
                alt="Bot Logo"
                className="rounded-full object-cover"
              />
              <p className="text-lg text-zinc-200 mt-6">
                Alice AI is a conversational chatbot designed to make digital
                interactions smarter, faster, and more human. Whether you're
                chatting for help, curiosity, or connection, Alice AI is always
                ready to listen, respond, and learn.
              </p>
            </div>
            <div className="mt-8 text-center text-sm opacity-80">
              <p>Need help? Contact support@aliceai.com</p>
            </div>
          </div>
        )}

        <div className="w-full md:w-1/2 p-8 md:p-10 bg-black/40">
          <div className="flex justify-center mb-2 md:hidden">
            <img
              src={alicedark}
              alt="Bot Logo"
              className="rounded-full object-cover"
            />
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-1 hidden lg:block md:block">
            Welcome Back
          </h2>
          <p className="text-center text-gray-50 mb-8">
            Sign in to unlock smarter conversations.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-50 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-50 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-1 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In <FiArrowRight className="ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
