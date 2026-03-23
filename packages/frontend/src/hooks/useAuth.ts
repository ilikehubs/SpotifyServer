import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/status')
      .then((res) => setIsAuthenticated(res.data.authenticated))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, login, logout };
}
