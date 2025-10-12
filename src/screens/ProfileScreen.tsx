import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
        }
    }, [user]);

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/\d/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Update profile data
            const { error: profileError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (profileError) {
                toast.error('Error updating profile: ' + profileError.message);
                setIsLoading(false);
                return;
            }

            // Handle password change if new password is provided
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    toast.error('New passwords do not match');
                    setIsLoading(false);
                    return;
                }

                const passwordError = validatePassword(newPassword);
                if (passwordError) {
                    toast.error(passwordError);
                    setIsLoading(false);
                    return;
                }

                const { error: passwordUpdateError } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (passwordUpdateError) {
                    toast.error('Error updating password: ' + passwordUpdateError.message);
                    setIsLoading(false);
                    return;
                }

                // Clear password fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }

            toast.success('Profile updated successfully!');
        } catch {
            toast.error('An unexpected error occurred');
        }

        setIsLoading(false);
    };



    return (
        <div className="min-h-screen p-4 sm:p-6">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ArrowLeft size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
                </button>
                <h1 className="text-2xl font-bold">Profile</h1>
                <div className="w-10"></div>
            </header>

            <motion.div
                className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={user?.email || ''}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Password Change */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                        <div className="space-y-4">
                            <Input
                                label="Current Password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ProfileScreen;
