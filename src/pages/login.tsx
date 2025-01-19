import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      login('your-auth-token'); // Call the login function from AuthContext with a token
      toast.success('Logged in successfully');
      navigate('/'); // Redirect to home page
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleGoogleLoginSuccess = (response: any) => {
    console.log(response);
    login(response.credential); // Call the login function from AuthContext with Google token
    toast.success('Logged in successfully with Google');
    navigate('/'); // Redirect to home page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-200 via-teal-300 to-teal-500">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Welcome Back</h1>
        <p className="text-sm text-gray-600 mb-8 text-center">
          Please sign in to your account to continue.
        </p>
        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300 font-semibold shadow-md"
          >
            Login
          </button>
        </form>
        <div className="mt-8 flex flex-col items-center">
          <p className="text-center text-sm text-gray-600 mb-4">Or log in with</p>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => {
              console.error('An error occurred.');
              toast.error('Google login failed');
            }}
          />
        </div>
      </div>
    </div>
  );
}
