import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('pscrm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginAuth = (userData) => {
    setUser(userData);
    sessionStorage.setItem('pscrm_user', JSON.stringify(userData));
  };

  const logoutAuth = () => {
    setUser(null);
    sessionStorage.removeItem('pscrm_user');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, loginAuth, logoutAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
