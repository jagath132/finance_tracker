import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  needsEmailConfirmation: boolean;
  emailConfirmed: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    requiresConfirmation?: boolean;
  }>;
  logout: () => Promise<void>;
  resendConfirmationEmail: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  handleEmailConfirmation: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  needsEmailConfirmation: false,
  emailConfirmed: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  resendConfirmationEmail: async () => ({ success: false }),
  handleEmailConfirmation: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }

      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        setSession(session);
        setNeedsEmailConfirmation(false);
        setEmailConfirmed(true);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setNeedsEmailConfirmation(false);
        setEmailConfirmed(false);
      } else if (event === "USER_UPDATED" && session) {
        setUser(session.user);
        setSession(session);
        setNeedsEmailConfirmation(false);
        setEmailConfirmed(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // The auth state change listener will handle setting user/session
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error('Login fetch error:', error);
      return { success: false, error: "Network error. Please check your connection and try again." };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if email confirmation is required
        if (!data.session) {
          // Email confirmation is required
          setNeedsEmailConfirmation(true);
          return { success: true, requiresConfirmation: true };
        } else {
          // User is immediately signed in (confirmation disabled)
          setUser(data.user);
          setSession(data.session);
          setNeedsEmailConfirmation(false);
          return { success: true };
        }
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }
      // The auth state change listener will handle setting user/session to null
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const handleEmailConfirmation = () => {
    setEmailConfirmed(true);
    setNeedsEmailConfirmation(false);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      needsEmailConfirmation,
      emailConfirmed,
      login,
      register,
      logout,
      resendConfirmationEmail,
      handleEmailConfirmation,
    }),
    [user, session, loading, needsEmailConfirmation, emailConfirmed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
