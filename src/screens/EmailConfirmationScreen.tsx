import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

const EmailConfirmationScreen: React.FC = () => {
  const { resendConfirmationEmail, emailConfirmed, user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const confirmed = searchParams.get('confirmed') === 'true';
  const error = searchParams.get('error');

  useEffect(() => {
    if ((emailConfirmed && user) || confirmed) {
      // Auto-navigate to dashboard after a short delay to show success message
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [emailConfirmed, user, confirmed, navigate]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendConfirmationEmail(email);
      if (result.success) {
        toast.success('Confirmation email sent! Please check your inbox.');
      } else {
        toast.error(result.error || 'Failed to resend email');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 pb-20">
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
            {emailConfirmed ? (
              <CheckCircle className="text-green-500" size={40} strokeWidth={1.5} />
            ) : (
              <Mail className="text-brand-green" size={40} strokeWidth={1.5} />
            )}
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-light-text dark:text-dark-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {(emailConfirmed || confirmed) ? 'Email Confirmed!' : 'Check Your Email'}
          </motion.h1>
          <motion.p
            className="text-light-text-secondary dark:text-dark-text-secondary mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {(emailConfirmed || confirmed)
              ? 'Your email has been successfully confirmed. Redirecting to dashboard...'
              : "We've sent you a confirmation link to verify your account."
            }
          </motion.p>
        </div>

        <motion.div
          className="bg-light-secondary dark:bg-dark-secondary p-6 sm:p-8 rounded-2xl shadow-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {!(emailConfirmed || confirmed) && !error && (
            <>
              <motion.div variants={itemVariants} className="text-center mb-6">
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Click the link in the email to complete your registration and start using Cointrail.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  Didn't receive the email? Enter your email address below to resend it.
                </p>
                <div className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-light-primary dark:bg-dark-primary border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                  <Button
                    onClick={handleResendEmail}
                    isLoading={isResending}
                    className="w-full"
                    disabled={!email}
                  >
                    {isResending ? (
                      <>
                        <RefreshCw size={18} className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Resend Confirmation Email'
                    )}
                  </Button>
                </div>
              </motion.div>
            </>
          )}

          {(emailConfirmed || confirmed) && !error && (
            <motion.div variants={itemVariants} className="text-center mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  🎉 Welcome to Cointrail!
                </p>
                <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                  Your account has been successfully verified. You can now access all features.
                </p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div variants={itemVariants} className="text-center mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 font-medium">
                  ⚠️ Confirmation Failed
                </p>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  {error === 'confirmation_failed'
                    ? 'There was an issue confirming your email. Please try again or contact support.'
                    : 'An unexpected error occurred. Please try again.'
                  }
                </p>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-brand-green hover:underline"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailConfirmationScreen;