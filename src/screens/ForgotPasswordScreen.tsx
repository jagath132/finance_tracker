import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

const ForgotPasswordScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Password reset link sent! Please check your email.');
            setIsSubmitted(true);
        }
    };

    return (
        <div className="min-h-screen bg-light-primary dark:bg-dark-primary flex flex-col justify-center items-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Forgot Password</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
                        {isSubmitted
                            ? "If an account exists, you'll receive an email."
                            : "Enter your email to receive a password reset link."
                        }
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="bg-light-secondary dark:bg-dark-secondary p-6 sm:p-8 rounded-2xl shadow-lg text-center">
                        <p className="text-light-text dark:text-dark-text mb-6">You can now close this window.</p>
                        <Link to="/login">
                            <Button>Back to Login</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-light-secondary dark:bg-dark-secondary p-6 sm:p-8 rounded-2xl shadow-lg">
                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={<Mail size={20} className="text-gray-500" />} required />
                        <div className="mt-6">
                            <Button type="submit" isLoading={isLoading}>Send Reset Link</Button>
                        </div>
                    </form>
                )}

                <p className="text-center mt-8 text-light-text-secondary dark:text-dark-text-secondary">
                    <Link to="/login" className="font-semibold text-brand-green hover:underline flex items-center justify-center">
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordScreen;
