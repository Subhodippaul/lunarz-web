"use client";
import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "email" | "google";
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGOUT" };

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
} | null>(null);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Mock users database (in real app, this would be in a backend)
const mockUsers = [
  {
    id: "1",
    email: "john@example.com",
    password: "password123",
    name: "John Doe",
    provider: "email" as const,
  },
  {
    id: "2",
    email: "jane@example.com",
    password: "password123",
    name: "Jane Smith",
    provider: "email" as const,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("lunarz_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: "SET_USER", payload: user });
      } catch (error) {
        localStorage.removeItem("lunarz_user");
      }
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const authUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      };
      
      localStorage.setItem("lunarz_user", JSON.stringify(authUser));
      dispatch({ type: "SET_USER", payload: authUser });
      return true;
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock Google user data
    const googleUser: User = {
      id: `google_${Date.now()}`,
      email: "user@gmail.com",
      name: "Google User",
      avatar: "https://via.placeholder.com/40",
      provider: "google",
    };
    
    localStorage.setItem("lunarz_user", JSON.stringify(googleUser));
    dispatch({ type: "SET_USER", payload: googleUser });
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      provider: "email",
    };
    
    // Add to mock database
    mockUsers.push({
      id: newUser.id,
      email,
      password,
      name,
      provider: "email",
    });
    
    localStorage.setItem("lunarz_user", JSON.stringify(newUser));
    dispatch({ type: "SET_USER", payload: newUser });
    return true;
  };

  const logout = () => {
    localStorage.removeItem("lunarz_user");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      dispatch, 
      login, 
      loginWithGoogle, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}