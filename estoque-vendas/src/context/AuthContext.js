import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) setToken(stored);
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
