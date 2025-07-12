import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { state } = useContext(AuthContext);
  const location = useLocation();

  // If page requires authentication and user is not authenticated
  if (requireAuth && !state.isAuthenticated) {
    // Redirect to login with current location as parameter to return later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If page requires admin and user is not admin
  if (requireAdmin && (!state.isAuthenticated || !state.user?.is_admin)) {
    return <Navigate to="/" replace />;
  }

  // If everything is ok, show content
  return children;
};

export default ProtectedRoute; 