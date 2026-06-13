import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUserThunk } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-primary text-text-primary">
        <div className="relative flex items-center justify-center">
          {/* Premium global loading spinner */}
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-accent border-r-transparent border-b-transparent border-l-transparent"></div>
          {/* Pulsating Brand text inside the spinner */}
          <div className="absolute text-xs font-black tracking-widest text-accent uppercase animate-pulse">
            MyTube
          </div>
        </div>
        <p className="mt-8 text-xs font-bold tracking-widest text-text-muted uppercase animate-pulse">
          Loading application...
        </p>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#212121',
            color: '#f1f1f1',
            border: '1px solid #303030',
          },
          success: {
            iconTheme: {
              primary: '#ff0000',
              secondary: '#f1f1f1',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4444',
              secondary: '#f1f1f1',
            },
          },
        }}
      />
      <Outlet />
    </>
  );
}

export default App;
