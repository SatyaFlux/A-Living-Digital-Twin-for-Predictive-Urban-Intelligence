import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const DEFAULT_DEMO_USERS: Record<UserRole, User> = {
  Admin: {
    id: 1,
    email: 'admin@citytwin.ai',
    full_name: 'Dr. Sarah Chen (Chief City Architect)',
    role: 'Admin',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  Analyst: {
    id: 2,
    email: 'analyst@citytwin.ai',
    full_name: 'Alex Rivera (Urban Systems Analyst)',
    role: 'Analyst',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  Viewer: {
    id: 3,
    email: 'viewer@citytwin.ai',
    full_name: 'Public Community Observer',
    role: 'Viewer',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('twin_user');
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_USERS.Admin;
  });

  const loginAs = (targetRole: UserRole) => {
    const selectedUser = DEFAULT_DEMO_USERS[targetRole];
    setUser(selectedUser);
    localStorage.setItem('twin_user', JSON.stringify(selectedUser));
    api.setToken(`demo_token_${targetRole.toLowerCase()}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('twin_user');
    api.setToken(null);
  };

  const role: UserRole = user?.role || 'Viewer';

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
