import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary flex flex-col justify-between p-4 sm:p-6 lg:p-8 pb-20 font-sans overflow-hidden">
      {/* Logo and Tagline */}
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-full inline-block mb-6">
            <Coins className="text-brand-green" size={64} strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          Cointrail
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-light-text-secondary dark:text-dark-text-secondary mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        >
          Track your finances, take control.
        </motion.p>
      </div>

      {/* Action Buttons */}
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
      >
        <Link to="/register" className="block w-full">
          <button className="w-full bg-brand-green text-white font-bold py-4 px-4 rounded-xl text-lg hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-opacity-50">
            Get Started
          </button>
        </Link>
        <p className="text-center mt-6 text-light-text-secondary dark:text-dark-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-green hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
