import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('stockgpt_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('stockgpt_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!email.includes('@')) {
        setIsLoading(false);
        throw new Error("Please enter a valid email address.");
    }

    if (password.length < 6) {
        setIsLoading(false);
        throw new Error("Password must be at least 6 characters.");
    }

    // Mock validation success
    const mockUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    
    setUser(mockUser);
    localStorage.setItem('stockgpt_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!email.includes('@')) {
        setIsLoading(false);
        throw new Error("Please enter a valid email address.");
    }

    if (password.length < 6) {
        setIsLoading(false);
        throw new Error("Password must be at least 6 characters.");
    }

    if (!name.trim()) {
        setIsLoading(false);
        throw new Error("Name is required.");
    }

    const mockUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    setUser(mockUser);
    localStorage.setItem('stockgpt_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const googleSignIn = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Randomize name for "simulation" effect
    const names = ["Alex Trader", "Jordan Belfort", "Warren B.", "Crypto King"];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const mockUser: User = {
        id: 'g_' + Math.random().toString(36).substr(2, 9),
        name: randomName,
        email: `${randomName.toLowerCase().replace(' ', '.')}@gmail.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}&backgroundColor=c0aede`
    };
    setUser(mockUser);
    localStorage.setItem('stockgpt_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stockgpt_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, googleSignIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
