import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onDrop'> {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, isLoading = false, className, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full bg-brand-green text-white font-bold py-4 px-4 rounded-xl text-lg hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
