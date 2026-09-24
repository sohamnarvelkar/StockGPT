import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, SubscriptionTier } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => void;
  updateSubscription: (
    tier: SubscriptionTier,
    paymentId: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = "mock_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Simulated login
    await new Promise((r) => setTimeout(r, 800));

    const mockUser: User = {
      id: "local-user",
      name: email.split("@")[0],
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      tier:
        (localStorage.getItem(
          "tier_local-user"
        ) as SubscriptionTier) || "FREE",
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ) => {
    setIsLoading(true);

    // Simulated signup
    await new Promise((r) => setTimeout(r, 800));

    const mockUser: User = {
      id: "local-user",
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      tier: "FREE",
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
  };

  const googleSignIn = async () => {
    setIsLoading(true);

    // Simulated Google login
    await new Promise((r) => setTimeout(r, 800));

    const mockUser: User = {
      id: "google-user",
      name: "Google User",
      email: "googleuser@example.com",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=google`,
      tier:
        (localStorage.getItem(
          "tier_google-user"
        ) as SubscriptionTier) || "FREE",
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
  };

  const updateSubscription = async (
    tier: SubscriptionTier,
    paymentId: string
  ) => {
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    if (user) {
      const updatedUser = { ...user, tier };
      setUser(updatedUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(`tier_${user.id}`, tier);
    }

    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        googleSignIn,
        logout,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
