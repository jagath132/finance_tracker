import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Coins } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

const LoginScreen: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Logged in successfully!');
            navigate('/dashboard');
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
                    <motion.div
                        className="bg-light-secondary dark:bg-dark-secondary p-4 rounded-full inline-block mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    >
                        <Coins className="text-brand-green" size={40} strokeWidth={1.5} />
                    </motion.div>
                    <motion.h1
                        className="text-3xl font-bold text-light-text dark:text-dark-text"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p
                        className="text-light-text-secondary dark:text-dark-text-secondary"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        Login to continue to Cointrail.
                    </motion.p>
                </div>

                <motion.form onSubmit={handleSubmit} className="bg-light-secondary dark:bg-dark-secondary p-6 sm:p-8 rounded-2xl shadow-lg" variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants}>
                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={<Mail size={20} className="text-gray-500" />} required />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" icon={<Lock size={20} className="text-gray-500" />} required />
                    </motion.div>

                    <motion.div className="text-right mt-6 mb-6" variants={itemVariants}>
                        <Link to="/forgot-password" className="text-sm text-brand-green hover:underline">Forgot Password?</Link>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Button type="submit" isLoading={isLoading}>Login</Button>
                    </motion.div>
                </motion.form>

                <p className="text-center mt-8 text-light-text-secondary dark:text-dark-text-secondary">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-brand-green hover:underline">Sign Up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginScreen;
