import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { User, Lock } from 'lucide-react';
import icon from '../assets/icon.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Clear any previous user information
    logout();

    if (username === 'admin' && password === 'password') {
      login('your-auth-token', true); // Pass true to indicate hardcoded credentials
      toast.success('Logged in successfully');
      navigate('/');
    } else {
      toast.error('Invalid credentials');
    }

    setIsLoading(false);
  };

  const handleGoogleLoginSuccess = (response: any) => {
    login(response.credential);
    toast.success('Logged in successfully with Google');
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-tealLight via-teal to-tealDark p-4"
    >
      {/* Logo Section */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="flex flex-row items-center justify-center mb-8"
      >
        <motion.img 
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          src={icon}
          alt="Transaction Manager" 
          className="h-16 w-16 mr-4 rounded-xl "
        />
        <motion.span 
          className="text-4xl md:text-5xl font-bold text-white font-playwrite-in"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Transaction Manager
        </motion.span>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <motion.h1 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-extrabold mb-2 text-center text-darkText"
        >
          Welcome Back
        </motion.h1>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-600 mb-8 text-center"
        >
          Please sign in to your account to continue
        </motion.p>

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <label htmlFor="username" className="block text-sm font-medium text-darkText mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal p-2.5 transition-all duration-200"
                placeholder="Enter your username"
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-darkText mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal p-2.5 transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full bg-teal text-darkText py-3 rounded-lg hover:bg-tealDark hover:text-white transition-all duration-200 font-semibold shadow-md relative overflow-hidden ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-300 w-full" />
            <p className="text-center text-sm text-gray-500 bg-white px-4 absolute">
              Or continue with
            </p>
          </div>

          <motion.div 
            className="mt-8 flex justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                console.error('An error occurred.');
                toast.error('Google login failed');
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}