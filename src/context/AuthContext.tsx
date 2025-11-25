import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

interface AuthContextType {
  user: User | null;
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
  loading: true,
  needsEmailConfirmation: false,
  emailConfirmed: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => { },
  resendConfirmationEmail: async () => ({ success: false }),
  handleEmailConfirmation: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setNeedsEmailConfirmation(!currentUser.emailVerified);
        setEmailConfirmed(currentUser.emailVerified);
      } else {
        setNeedsEmailConfirmation(false);
        setEmailConfirmed(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Login failed";
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User not found.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Try again later.";
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with full name
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      // Send verification email
      await sendEmailVerification(userCredential.user);

      return { success: true, requiresConfirmation: true };
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else {
        errorMessage = error.message || "Registration failed";
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    // Firebase handles this on the user object, which we need to be logged in for usually,
    // or we use a specific API. For simplicity in this migration, we'll implement a basic version
    // if the user is currently the currentUser.
    if (auth.currentUser && auth.currentUser.email === email) {
      try {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: "Must be logged in to resend verification." };
  };

  const handleEmailConfirmation = () => {
    // In Firebase, this is usually handled by reloading the user
    if (auth.currentUser) {
      auth.currentUser.reload().then(() => {
        setEmailConfirmed(auth.currentUser?.emailVerified ?? false);
        setNeedsEmailConfirmation(!(auth.currentUser?.emailVerified ?? true));
      });
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      needsEmailConfirmation,
      emailConfirmed,
      login,
      register,
      logout,
      resendConfirmationEmail,
      handleEmailConfirmation,
    }),
    [user, loading, needsEmailConfirmation, emailConfirmed]
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
