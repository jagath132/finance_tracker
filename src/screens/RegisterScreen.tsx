import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Coins } from 'lucide-react';

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
import PasswordStrength from '../components/ui/PasswordStrength';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

const RegisterScreen: React.FC = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const passwordStrength = useMemo(() => {
        if (password.length === 0) return '';
        if (password.length < 6) return 'weak';
        const hasNumber = /\d/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        if (password.length >= 8 && hasNumber && hasUpperCase && hasLowerCase) return 'strong';
        if (password.length >= 6) return 'medium';
        return 'weak';
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }
        setIsLoading(true);
        
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        });

        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Registration successful! Please check your email to verify your account.');
            navigate('/login');
        }
    };

    return (
        <div className="h-screen bg-light-primary dark:bg-dark-primary flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="bg-light-secondary dark:bg-dark-secondary p-4 rounded-full inline-block mb-4">
                        <Coins className="text-brand-green" size={40} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Create Account</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Join Cointrail to manage your finances.</p>
                </div>

                <motion.form onSubmit={handleSubmit} className="bg-light-secondary dark:bg-dark-secondary p-6 sm:p-8 rounded-2xl shadow-lg" variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants}>
                        <Input label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" icon={<User size={20} className="text-gray-500" />} required />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={<Mail size={20} className="text-gray-500" />} required />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" icon={<Lock size={20} className="text-gray-500" />} required />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <PasswordStrength strength={passwordStrength} />
                    </motion.div>
                    <motion.div className="mt-4" variants={itemVariants}>
                        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" icon={<Lock size={20} className="text-gray-500" />} required />
                    </motion.div>

                    <motion.div className="mt-6" variants={itemVariants}>
                        <Button type="submit" isLoading={isLoading}>Sign Up</Button>
                    </motion.div>
                </motion.form>

                <p className="text-center mt-8 text-light-text-secondary dark:text-dark-text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-brand-green hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterScreen;
