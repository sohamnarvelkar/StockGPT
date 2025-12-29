import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SubscriptionTier } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => void;
  updateSubscription: (tier: SubscriptionTier, paymentId: string) => Promise<void>;
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!email.includes('@')) {
        setIsLoading(false);
        throw new Error("Please enter a valid email address.");
    }

    const mockUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        tier: 'FREE'
    };
    
    setUser(mockUser);
    localStorage.setItem('stockgpt_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        tier: 'FREE'
    };
    setUser(mockUser);
    localStorage.setItem('stockgpt_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const googleSignIn = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const names = ["Alex Trader", "Jordan Belfort", "Warren B.", "Crypto King"];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const mockUser: User = {
        id: 'g_' + Math.random().toString(36).substr(2, 9),
        name: randomName,
        email: `${randomName.toLowerCase().replace(' ', '.')}@gmail.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}&backgroundColor=c0aede`,
        tier: 'FREE'
    };
    setUser(mockUser);
    localStorage.setItem('stockgpt_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const updateSubscription = async (tier: SubscriptionTier, paymentId: string) => {
    setIsLoading(true);
    // Simulate PayPal API Latency and Webhook verification
    console.log("Verifying PayPal Transaction:", paymentId, "for plan:", tier);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    if (user) {
        const updatedUser = { ...user, tier };
        setUser(updatedUser);
        localStorage.setItem('stockgpt_user', JSON.stringify(updatedUser));
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stockgpt_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, googleSignIn, logout, updateSubscription }}>
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