import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../api/auth.api';
import { setUser, logout } from '../store/slices/authSlice';

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    const validateSession = async () => {
      try {
        const user = await getCurrentUser();
        if (isMounted) {
          dispatch(setUser(user));
        }
      } catch {
        if (isMounted) {
          dispatch(logout());
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-primary text-text-primary">
        <div className="relative flex items-center justify-center">
          {/* Premium Spinner outer ring */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
          {/* Inner pulsating dot */}
          <div className="absolute h-10 w-10 animate-ping rounded-full bg-accent/20"></div>
        </div>
        <p className="mt-6 text-xs font-bold tracking-widest text-text-secondary uppercase animate-pulse">
          Verifying credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
