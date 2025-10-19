import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-primary dark:bg-dark-primary text-light-text dark:text-dark-text">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-brand-green text-white rounded hover:bg-green-600 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundScreen;