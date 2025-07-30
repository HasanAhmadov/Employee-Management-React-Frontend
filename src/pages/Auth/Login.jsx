import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Floating colorful blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.1,
              scale: 0.4,
            }}
            animate={{
              y: [null, (Math.random() - 0.5) * 150],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 10 + Math.random() * 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 blur-2xl"
            style={{
              width: `${20 + Math.random() * 60}px`,
              height: `${20 + Math.random() * 60}px`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="relative bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-purple-100"
      >
        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <motion.h2
            className="text-4xl font-bold text-gray-800 mb-2"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome
          </motion.h2>
          <motion.p
            className="text-gray-500 text-lg"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Enter your credentials to continue
          </motion.p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-red-100 text-red-600 p-4 rounded-xl mb-6 flex items-center border border-red-300"
          >
            <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div>
            <motion.label
              className={`block font-medium mb-2 transition-all duration-300 ${isFocused.email ? 'text-purple-500' : 'text-gray-500'}`}
              animate={{
                y: isFocused.email || email ? -5 : 0,
                scale: isFocused.email || email ? 0.9 : 1,
              }}
            >
              Email
            </motion.label>
            <motion.div className="relative" whileHover={{ scale: 1.01 }}>
              <input
                type="email"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-gray-800 placeholder-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused({ ...isFocused, email: true })}
                onBlur={() => setIsFocused({ ...isFocused, email: false })}
                required
                placeholder="you@example.com"
              />
            </motion.div>
          </div>

          <div>
            <motion.label
              className={`block font-medium mb-2 transition-all duration-300 ${isFocused.password ? 'text-purple-500' : 'text-gray-500'}`}
              animate={{
                y: isFocused.password || password ? -5 : 0,
                scale: isFocused.password || password ? 0.9 : 1,
              }}
            >
              Password
            </motion.label>
            <motion.div className="relative" whileHover={{ scale: 1.01 }}>
              <input
                type="password"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-gray-800 placeholder-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused({ ...isFocused, password: true })}
                onBlur={() => setIsFocused({ ...isFocused, password: false })}
                required
                placeholder="••••••••"
              />
            </motion.div>
          </div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-2"
          >
            <motion.button
              type="submit"
              className="w-full relative overflow-hidden group rounded-xl shadow-md"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 transition-all duration-300 group-hover:brightness-110 rounded-xl"></div>
              <div className="relative z-10 flex items-center justify-center py-4">
                <span className="text-white font-semibold text-lg tracking-wide">Login</span>
                <motion.svg
                  className="w-5 h-5 ml-2 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </motion.svg>
              </div>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
