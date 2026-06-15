import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarOpen } from '../store/slices/uiSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export const MainLayout = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleMediaChange = (event) => {
      setIsMobile(event.matches);
      if (event.matches) {
        dispatch(setSidebarOpen(false));
      }
    };

    handleMediaChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [dispatch]);

  return (
    <div className="min-h-svh bg-bg-primary text-text-primary">
      {/* Fixed Navbar at top */}
      <Navbar />

      <div className="flex">
        {/* Mobile overlay for closing the sidebar when it is open */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 opacity-100 transition-opacity duration-200 md:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
            aria-hidden="true"
          />
        )}

        {/* Fixed/Collapsible Sidebar on left */}
        <Sidebar />

        {/* Main Content Pane */}
        <main
          className={`flex-1 min-w-0 min-h-[calc(100vh-3.5rem)] pt-14 transition-all duration-200 ${
            sidebarOpen ? 'md:pl-64 pl-0' : 'md:pl-20 pl-0'
          }`}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
