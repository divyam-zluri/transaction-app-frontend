import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import zluri from '../assets/zluri.webp';

interface User {
  name: string;
  picture: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean | undefined;
  user: User | null;
  login: (token: string, isHardcoded?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  let logoutTimer: NodeJS.Timeout;

  const TOKEN_EXPIRY_DURATION = 5 * 60; // 5 minutes in seconds

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logout(); // Token is expired
      } else {
        setIsAuthenticated(true);
        decodeToken(token);
        startLogoutTimer(TOKEN_EXPIRY_DURATION);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const startLogoutTimer = (duration: number = TOKEN_EXPIRY_DURATION) => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      logout();
    }, duration * 1000); // Duration in seconds
  };

  const decodeToken = (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      const userInfo: User = {
        name: decoded.name,
        picture: decoded.picture,
        email: decoded.email,
      };
      setUser(userInfo);
    } catch (error) {
      console.error('Failed to decode token:', error);
      setUser(null); // Clear user information on error
    }
  };

  const login = (token: string, isHardcoded: boolean = false) => {
    setIsAuthenticated(true);
    if (isHardcoded) {
      const mockUser: User = {
        name: 'Admin',
        picture: zluri,
        email: 'admin@example.com',
      };
      setUser(mockUser);
    } else {
      localStorage.setItem('authToken', token);
      decodeToken(token);
    }
    startLogoutTimer(TOKEN_EXPIRY_DURATION);
    navigate('/'); // Redirect to home page after login
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
    clearTimeout(logoutTimer);
    navigate('/login');
  };

  useEffect(() => {
    const handleActivity = () => {
      if (isAuthenticated) {
        startLogoutTimer(TOKEN_EXPIRY_DURATION);
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
