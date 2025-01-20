import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header';
import Home from './pages/home';
import Login from './pages/login';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/privateRoute';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  const handleGoogleLoginSuccess = (response: any) => {
    const { credential } = response;
    const decoded: any = jwtDecode(credential);

    // Extract user information
    const userInfo = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
    };

    // Use the login function from AuthContext
    const { login } = useAuth();
    login(credential);
  };

  const handleGoogleLoginError = () => {
    console.error("Login Failed");
  };

  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ''}>
      <Router>
        <AuthProvider>
          <div className="bg-cream min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <>
                      <Header onRefresh={handleRefresh} />
                      <main className="container mx-auto p-6">
                        <Home key={refreshKey} />
                      </main>
                    </>
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}