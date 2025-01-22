import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarLoader } from './barLoader';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === undefined) {
    // Show BarLoader while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader/>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;