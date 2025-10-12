import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Upload, Download, LogOut, User, Sun, Moon, Monitor, Trash2, AlertTriangle, BarChart3, Receipt, Tag, Search, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';

const SettingsScreen: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { refetch: refetchTransactions } = useTransactions();
    const { refetch: refetchCategories } = useCategories();
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Logged out successfully');
            navigate('/login');
        }
    };

    const handleResetData = async () => {
        const toastId = toast.loading('Resetting data...');
        const { error } = await supabase.rpc('reset_user_data');
        if (error) {
            toast.error(`Failed to reset data: ${error.message}`, { id: toastId });
        } else {
            await refetchTransactions();
            await refetchCategories();
            toast.success('All your data has been reset.', { id: toastId });
        }
        setIsResetModalOpen(false);
    };

    const themeIcons = {
        light: <Sun size={20} />,
        dark: <Moon size={20} />,
        system: <Monitor size={20} />,
    };

    const features = [
        { title: 'Dashboard', description: 'Overview of your finances with charts and recent transactions.', color: 'bg-blue-100 dark:bg-blue-900', icon: BarChart3 },
        { title: 'Transactions', description: 'View, add, edit, and manage your financial transactions.', color: 'bg-green-100 dark:bg-green-900', icon: Receipt },
        { title: 'Categories', description: 'Organize your transactions into custom categories.', color: 'bg-yellow-100 dark:bg-yellow-900', icon: Tag },
        { title: 'Search', description: 'Quickly find specific transactions.', color: 'bg-purple-100 dark:bg-purple-900', icon: Search },
        { title: 'Import/Export', description: 'Import transactions from CSV or export your data.', color: 'bg-pink-100 dark:bg-pink-900', icon: Database },
        { title: 'Profile', description: 'Manage your account information and password.', color: 'bg-indigo-100 dark:bg-indigo-900', icon: User },
    ];

    return (
        <>
            <div className="min-h-screen p-4 sm:p-6">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Settings</h1>
                </header>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-3">Account</h2>
                        <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg">
                            <Link to="/profile" className="flex items-center justify-between p-4 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center">
                                    <div className="p-3 bg-gray-300 dark:bg-gray-700 rounded-full mr-4">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{user?.user_metadata?.full_name}</p>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{user?.email}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-500" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-3">Display</h2>
                        <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-4">
                            <label className="text-sm">Theme</label>
                            <div className="flex justify-around items-center bg-light-primary dark:bg-dark-primary p-1 rounded-lg mt-2">
                                {(['light', 'dark', 'system'] as const).map(t => (
                                    <button key={t} onClick={() => setTheme(t)} className={`w-full p-2 rounded-md flex justify-center items-center gap-2 capitalize text-sm transition-colors ${theme === t ? 'bg-brand-green text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                        {themeIcons[t]} {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-3">Data Management</h2>
                        <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg divide-y divide-light-border dark:divide-dark-border">
                            <Link to="/import" className="flex items-center justify-between p-4 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center"><Upload size={20} className="mr-4" /><span>Import Transactions</span></div>
                                <ChevronRight size={20} className="text-gray-500" />
                            </Link>
                            <Link to="/export" className="flex items-center justify-between p-4 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center"><Download size={20} className="mr-4" /><span>Export Data</span></div>
                                <ChevronRight size={20} className="text-gray-500" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-3">Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    className={`${feature.color} rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <h3 className="font-semibold flex items-center"><feature.icon size={24} className="mr-2" />{feature.title}</h3>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">Danger Zone</h2>
                        <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg">
                            <button onClick={() => setIsResetModalOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-red-900/20 transition-colors text-brand-red">
                                <div className="flex items-center"><AlertTriangle size={20} className="mr-4" /><span>Reset All Data</span></div>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg">
                        <button onClick={handleLogout} className="w-full flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-brand-red">
                            <LogOut size={20} className="mr-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleResetData}
                title="Reset All Data"
                message="Are you absolutely sure? This will permanently delete all your transactions and categories. This action cannot be undone."
            />
        </>
    );
};

export default SettingsScreen;
