import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const UpdatePasswordScreen: React.FC = () => {
    const navigate = useNavigate();
    const { session } = useAuth();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // This screen is only for users who arrived via a password reset link.
        // If they are already fully logged in, redirect them.
        if (session && session.user.user_metadata.email) {
             navigate('/dashboard');
        }
    }, [session, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Password updated successfully! You can now log in.');
            // Log the user out so they have to re-login with the new password
            await supabase.auth.signOut();
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-dark-primary flex flex-col justify-center items-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Set New Password</h1>
                    <p className="text-gray-400 mt-2">Please enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-dark-secondary p-6 sm:p-8 rounded-2xl shadow-lg">
                    <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" icon={<Lock size={20} className="text-gray-500" />} required />
                    <div className="mt-6">
                        <Button type="submit" isLoading={isLoading}>Update Password</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default UpdatePasswordScreen;
