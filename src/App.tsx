import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import BottomNavBar from "./components/nav/BottomNavBar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FloatingActionButton from "./components/ui/FloatingActionButton";
import { useModal } from "./context/ModalContext";
import { supabase } from "./lib/supabase";

// Lazy load screens with preload for critical routes
const WelcomeScreen = lazy(() => import("./screens/WelcomeScreen"));
const LoginScreen = lazy(() => import("./screens/LoginScreen"));
const RegisterScreen = lazy(() => import("./screens/RegisterScreen"));
const DashboardScreen = lazy(() => import("./screens/DashboardScreen"));
const AddTransactionScreen = lazy(
  () => import("./screens/AddTransactionScreen")
);
const TransactionDetailScreen = lazy(
  () => import("./screens/TransactionDetailScreen")
);
const CategoriesScreen = lazy(() => import("./screens/CategoriesScreen"));
const SettingsScreen = lazy(() => import("./screens/SettingsScreen"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen"));
const ImportTransactionsScreen = lazy(
  () => import("./screens/ImportTransactionsScreen")
);
const ExportDataScreen = lazy(() => import("./screens/ExportDataScreen"));
const ForgotPasswordScreen = lazy(
  () => import("./screens/ForgotPasswordScreen")
);
const UpdatePasswordScreen = lazy(
  () => import("./screens/UpdatePasswordScreen")
);
const EmailConfirmationScreen = lazy(
  () => import("./screens/EmailConfirmationScreen")
);
const SearchScreen = lazy(() => import("./screens/SearchScreen"));
const TransactionsScreen = lazy(() => import("./screens/TransactionsScreen"));
const NotFoundScreen = lazy(() => import("./screens/NotFoundScreen"));

// Preload critical routes
if (typeof window !== "undefined") {
  // Preload dashboard and transactions for authenticated users
  import("./screens/DashboardScreen");
  import("./screens/TransactionsScreen");
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { modalType, transaction, closeModal } = useModal();

  console.log('AppContent: Current location:', location.pathname);

  // Handle email confirmation links
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        // This is an email confirmation link
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Confirmation error:", error);
            navigate("/email-confirmation?error=confirmation_failed");
          } else if (data.session) {
            // Successfully confirmed, redirect to email confirmation screen
            navigate("/email-confirmation?confirmed=true");
          }
        } catch (error) {
          console.error("Confirmation error:", error);
          navigate("/email-confirmation?error=confirmation_failed");
        }
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  const showNavBar = [
    "/dashboard",
    "/categories",
    "/settings",
    "/transactions",
  ].includes(location.pathname);
  const showFab = ["/dashboard"].includes(location.pathname);

  return (
    <div className="relative bg-light-primary dark:bg-dark-primary text-light-text dark:text-dark-text min-h-screen">
      <main className={showNavBar ? "pb-20" : ""}>
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route
              path="/email-confirmation"
              element={<EmailConfirmationScreen />}
            />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/update-password" element={<UpdatePasswordScreen />} />

            {/* Authenticated Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/:id"
              element={
                <ProtectedRoute>
                  <TransactionDetailScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/import"
              element={
                <ProtectedRoute>
                  <ImportTransactionsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/export"
              element={
                <ProtectedRoute>
                  <ExportDataScreen />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
          {(modalType === "addTransaction" ||
            modalType === "editTransaction") && (
            <AddTransactionScreen
              isOpen={true}
              onClose={closeModal}
              transaction={transaction || undefined}
            />
          )}
        </Suspense>
      </main>
      {showNavBar && <BottomNavBar />}
      {showFab && <FloatingActionButton />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
