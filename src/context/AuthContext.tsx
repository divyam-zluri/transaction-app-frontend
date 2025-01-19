import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  let logoutTimer: NodeJS.Timeout;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      startLogoutTimer();
    }
  }, []);

  const startLogoutTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      logout();
    }, 30 * 60 * 1000); // 30 minutes
  };

  const login = (token: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('authToken', token);
    startLogoutTimer();
    navigate('/'); // Redirect to home page after login
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    clearTimeout(logoutTimer);
    navigate('/login');
  };

  useEffect(() => {
    const handleActivity = () => {
      if (isAuthenticated) {
        startLogoutTimer();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};