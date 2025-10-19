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
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RegisterScreen: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
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

        try {
            const result = await register(fullName, email, password);
            if (result.success) {
                if (result.requiresConfirmation) {
                    // Email confirmation is required
                    toast.success('Registration successful! Please check your email to confirm your account.');
                    navigate('/email-confirmation');
                } else {
                    // User is immediately signed in
                    toast.success('Registration successful! Welcome to Cointrail.');
                    navigate('/dashboard');
                }
            } else {
                toast.error(result.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            toast.error('Registration failed. Please try again.');
        }

        setIsLoading(false);
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
                        Create Account
                    </motion.h1>
                    <motion.p
                        className="text-light-text-secondary dark:text-dark-text-secondary"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        Join Cointrail to manage your finances.
                    </motion.p>
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
