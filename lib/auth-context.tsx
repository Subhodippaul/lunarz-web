/**
 * Authentication Context with Supabase
 * Replaces Firebase Auth
 * Supports dummy login (123456/123456) and Supabase authentication
 */

"use client";
import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getUserById } from "./supabase-services";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "email" | "google";
  isAdmin?: boolean;
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
  refreshUser: () => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Listen to Supabase auth state changes
  useEffect(() => {
    let initialLoad = true;

    // Check for dummy user in localStorage first
    const dummyUserStr = localStorage.getItem("dummyUser");
    if (dummyUserStr) {
      try {
        const dummyUser = JSON.parse(dummyUserStr);
        dispatch({ type: "SET_USER", payload: dummyUser });
        initialLoad = false;
      } catch (error) {
        console.error("Error parsing dummy user:", error);
        localStorage.removeItem("dummyUser");
      }
    }

    // Get initial session (only runs once on mount)
    if (initialLoad) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const user = await convertSupabaseUserToUser(session.user);
          dispatch({ type: "SET_USER", payload: user });
        } else {
          dispatch({ type: "SET_USER", payload: null });
        }
      });
    }

    // Listen for real auth events (sign-in, sign-out, token refresh)
    // We deliberately do NOT set isLoading here so navigating between pages
    // doesn't flash the loading spinner.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only handle actual sign-in / sign-out events, not TOKEN_REFRESHED
      // which fires on every page focus and causes spurious loading states.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        if (session?.user) {
          // For OAuth signups (Google), create profile if it doesn't exist yet
          if (event === "SIGNED_IN") {
            try {
              await fetch("/api/auth/create-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: session.user.id,
                  email: session.user.email,
                  display_name:
                    session.user.user_metadata?.display_name ||
                    session.user.user_metadata?.full_name ||
                    session.user.email?.split("@")[0],
                }),
              });
            } catch {
              // Non-fatal
            }
          }
          const user = await convertSupabaseUserToUser(session.user);
          dispatch({ type: "SET_USER", payload: user });
        } else {
          // Check for dummy user before clearing
          const dummyUserStr = localStorage.getItem("dummyUser");
          if (dummyUserStr) {
            try {
              const dummyUser = JSON.parse(dummyUserStr);
              dispatch({ type: "SET_USER", payload: dummyUser });
            } catch {
              dispatch({ type: "SET_USER", payload: null });
            }
          } else {
            dispatch({ type: "SET_USER", payload: null });
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    // Check for dummy credentials first
    if (email === "123456" && password === "123456") {
      const dummyUser: User = {
        id: "dummy-user-123456",
        email: "demo@lunarz.com",
        name: "Demo User",
        provider: "email",
        isAdmin: false,
      };
      
      localStorage.setItem("dummyUser", JSON.stringify(dummyUser));
      dispatch({ type: "SET_USER", payload: dummyUser });
      return true;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const user = await convertSupabaseUserToUser(data.user);
        dispatch({ type: "SET_USER", payload: user });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // OAuth will redirect, so we return true
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile via server-side API (uses service role — bypasses RLS)
        try {
          await fetch("/api/auth/create-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              display_name: name,
            }),
          });
        } catch (profileError) {
          console.warn("Profile creation failed:", profileError);
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: name,
          provider: "email",
          isAdmin: false,
        };

        dispatch({ type: "SET_USER", payload: user });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Registration error:", error);
      // Expose error code so the UI can show a specific message
      if (typeof window !== "undefined") {
        (window as any).__lastAuthError = error?.message ?? "";
      }
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("dummyUser");
      await supabase.auth.signOut();
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (supabaseUser) {
      try {
        const user = await convertSupabaseUserToUser(supabaseUser);
        dispatch({ type: "SET_USER", payload: user });
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      dispatch, 
      login, 
      loginWithGoogle, 
      register, 
      logout,
      refreshUser
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

// Helper function to convert Supabase user to our User type
async function convertSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
  const dbUser = await getUserById(supabaseUser.id);
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: dbUser?.display_name || supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
    avatar: supabaseUser.user_metadata?.avatar_url,
    provider: supabaseUser.app_metadata?.provider === 'google' ? 'google' : 'email',
    isAdmin: dbUser?.is_admin || false,
  };
}
