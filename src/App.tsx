import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNavBar from './components/nav/BottomNavBar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FloatingActionButton from './components/ui/FloatingActionButton';
import { useModal } from './context/ModalContext';

// Lazy load screens with preload for critical routes
const WelcomeScreen = lazy(() => import('./screens/WelcomeScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const AddTransactionScreen = lazy(() => import('./screens/AddTransactionScreen'));
const TransactionDetailScreen = lazy(() => import('./screens/TransactionDetailScreen'));
const CategoriesScreen = lazy(() => import('./screens/CategoriesScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const ImportTransactionsScreen = lazy(() => import('./screens/ImportTransactionsScreen'));
const ExportDataScreen = lazy(() => import('./screens/ExportDataScreen'));
const ForgotPasswordScreen = lazy(() => import('./screens/ForgotPasswordScreen'));
const UpdatePasswordScreen = lazy(() => import('./screens/UpdatePasswordScreen'));
const SearchScreen = lazy(() => import('./screens/SearchScreen'));
const TransactionsScreen = lazy(() => import('./screens/TransactionsScreen'));

// Preload critical routes
if (typeof window !== 'undefined') {
  // Preload dashboard and transactions for authenticated users
  import('./screens/DashboardScreen');
  import('./screens/TransactionsScreen');
}

const AppContent: React.FC = () => {
    const location = useLocation();
    const { modalType, transaction, closeModal } = useModal();

    const showNavBar = ['/dashboard', '/categories', '/settings', '/transactions'].includes(location.pathname);
    const showFab = ['/dashboard'].includes(location.pathname);

    return (
        <div className="relative bg-light-primary dark:bg-dark-primary text-light-text dark:text-dark-text min-h-screen">
            <main className={showNavBar ? 'pb-20' : ''}>
                <Suspense fallback={
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                    </div>
                }>
                    <Routes>
                        <Route path="/" element={<WelcomeScreen />} />
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/register" element={<RegisterScreen />} />
                        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                        <Route path="/update-password" element={<UpdatePasswordScreen />} />

                        {/* Authenticated Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
                        <Route path="/search" element={<ProtectedRoute><SearchScreen /></ProtectedRoute>} />
                        <Route path="/transactions" element={<ProtectedRoute><TransactionsScreen /></ProtectedRoute>} />
                        <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetailScreen /></ProtectedRoute>} />
                        <Route path="/categories" element={<ProtectedRoute><CategoriesScreen /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
                        <Route path="/import" element={<ProtectedRoute><ImportTransactionsScreen /></ProtectedRoute>} />
                        <Route path="/export" element={<ProtectedRoute><ExportDataScreen /></ProtectedRoute>} />
                    </Routes>
                    {(modalType === 'addTransaction' || modalType === 'editTransaction') && <AddTransactionScreen isOpen={true} onClose={closeModal} transaction={transaction || undefined} />}
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
