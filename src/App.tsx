import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header';
import Home from './pages/home';
import Login from './pages/login';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/privateRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; 

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
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