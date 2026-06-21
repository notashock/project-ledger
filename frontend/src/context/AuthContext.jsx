import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { loginUser, registerLogoutHandler } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedUsername) {
      setToken(storedToken);
      const defaultRole = storedUsername === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER';
      setUser({ username: storedUsername, role: storedRole || defaultRole });
    }
    setLoading(false);

    // Register global logout callback for Axios 401 interception
    registerLogoutHandler(() => {
      logout();
    });
  }, []);

  const login = async (username, password) => {
    const data = await loginUser(username, password);
    // data contains { token, username, role }
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role || 'ROLE_USER');
      setToken(data.token);
      setUser({ username: data.username, role: data.role || 'ROLE_USER' });
      navigate('/', { replace: true });
      return true;
    }
    throw new Error('Failed to retrieve authentication token');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center font-body-lg">
        <LoadingSpinner message="Authenticating..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center font-body-lg">
        <LoadingSpinner message="Authenticating..." />
      </div>
    );
  }

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

