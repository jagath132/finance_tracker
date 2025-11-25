// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { Loader2 } from 'lucide-react';

// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user, loading, needsEmailConfirmation } = useAuth();
//   const location = useLocation();

//   console.log('ProtectedRoute check:', { user: !!user, loading, needsEmailConfirmation, pathname: location.pathname });

//   if (loading) {
//     console.log('ProtectedRoute: Still loading, showing spinner');
//     return (
//       <div className="min-h-screen bg-dark-primary flex items-center justify-center">
//         <Loader2 className="animate-spin text-brand-green" size={48} />
//       </div>
//     );
//   }

//   if (needsEmailConfirmation) {
//     console.log('ProtectedRoute: Email confirmation needed, redirecting');
//     return <Navigate to="/email-confirmation" replace />;
//   }

//   if (!user) {
//     console.log('ProtectedRoute: No user, redirecting to login');
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   console.log('ProtectedRoute: User authenticated, rendering children');
//   return <>{children}</>;
// };

// export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, needsEmailConfirmation } = useAuth();
  const location = useLocation();

  // If we already have a user (even while loading), render children.
  // This prevents the spinner from blocking navigation after login.
  if (user) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-green" size={48} />
      </div>
    );
  }

  if (needsEmailConfirmation) {
    return <Navigate to="/email-confirmation" replace />;
  }

  // No user and not loading → redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;